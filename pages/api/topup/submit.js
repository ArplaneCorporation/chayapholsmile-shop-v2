import nextConnect from "next-connect";
import multer from "multer";
import { nanoid } from "nanoid"; // เปลี่ยนจาก uuidv4 เป็น nanoid
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Topup from "../../../models/topup";
import Config from "../../../models/config";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// ตั้งค่า multer ให้เก็บไฟล์ไว้ใน memory (RAM)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
});

// ฟังก์ชันส่งรูปสลิปไปตรวจสอบที่ API ภายนอก
async function verifySlipFromImage(imgBase64) {
  const resp = await fetch("https://slip-c.oiioioiiioooioio.download/api/slip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ img: imgBase64 }),
  });

  if (!resp.ok) throw new Error("ไม่สามารถเชื่อมต่อกับ slip API ได้");

  return resp.json();
}

// ฟังก์ชันช่วย normalize ชื่อเพื่อตรวจสอบความเท่ากันแบบไม่สนใจเว้นวรรคหรือตัวพิมพ์เล็กใหญ่
function normalize(str) {
  return str?.replace(/\s+/g, "").toLowerCase() || "";
}

// สร้าง API route ด้วย next-connect
const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, message: `Method '${req.method}' Not Allowed` });
  },
});

// ใช้ multer middleware ในการ parse multipart/form-data (ไฟล์อัปโหลด)
apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  await dbConnect();

  // ตรวจสอบ session ว่าล็อกอินหรือยัง
  const session = await getServerSession(req, res, authOptions(req));
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const userId = session.user.id;

  // ตรวจสอบว่ามีไฟล์อัปโหลดหรือไม่
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: "Missing file upload" });
  }

  try {
    // แปลงไฟล์เป็น base64 พร้อม prefix ชนิดไฟล์
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // เรียกฟังก์ชันตรวจสอบสลิปผ่าน API ภายนอก
    const slip = await verifySlipFromImage(base64Image);

    const { ref, receiver_name, amount } = slip.data;
    if (!ref || !receiver_name || !amount) throw new Error("ข้อมูลสลิปไม่สมบูรณ์");

    // ดึงชื่อบัญชีผู้รับเงินจาก Config
    const cfg = await Config.findOne().select("payment.bank_account_name_en");
    const expectedName = cfg?.payment?.bank_account_name_en;

    if (normalize(receiver_name) !== normalize(expectedName)) {
      throw new Error("ชื่อผู้รับเงินไม่ตรงกัน");
    }

    // ตรวจสอบข้อมูล QR PromptPay
    const qr = await PromptQR.findOne({ ref });
    if (!qr) throw new Error("QR ไม่พบ");
    if (qr.used) throw new Error("QR ถูกใช้งานไปแล้ว");
    if (qr.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");
    if (parseFloat(amount) !== qr.amount) throw new Error("ยอดเงินไม่ตรงกับ QR");

    // อัปเดตสถานะ QR ว่าใช้แล้ว
    qr.used = true;
    await qr.save();

    // บันทึกข้อมูลเติมเงินในฐานข้อมูล (ใช้ nanoid() แทน uuidv4())
    await Topup.create({
      _id: nanoid(10), // สร้าง ID ยาว 10 ตัวอักษร
      user: userId,
      reference: ref,
      type: "PROMPTPAY",
      amount: qr.amount,
      status: "success",
      verifyNote: "",
      createdAt: new Date(),
    });

    return res.status(200).json({ success: true, message: "เติมเงินสำเร็จ" });
  } catch (e) {
    // กรณีล้มเหลวบันทึกสถานะล้มเหลวด้วยสาเหตุ
    await Topup.create({
      _id: nanoid(10), // สร้าง ID ยาว 10 ตัวอักษร
      user: userId,
      reference: "unknown",
      type: "PROMPTPAY",
      amount: 0,
      status: "failed",
      verifyNote: e.message,
      createdAt: new Date(),
    });

    return res.status(400).json({ success: false, message: e.message });
  }
});

// ปิด body parser ของ Next.js เพราะ multer จะจัดการ multipart/form-data เอง
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute;
