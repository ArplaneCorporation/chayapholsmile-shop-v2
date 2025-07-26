import nextConnect from "next-connect";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Topup from "../../../models/topup";
import Config from "../../../models/config";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

async function verifySlipFromImage(imgBase64) {
  const resp = await fetch("https://slip-c.oiioioiiioooioio.download/api/slip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ img: imgBase64 }),
  });

  if (!resp.ok) throw new Error("ไม่สามารถเชื่อมต่อกับ slip API ได้");

  return resp.json();
}

function normalize(str) {
  return str?.replace(/\s+/g, "").toLowerCase() || "";
}

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, message: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions(req));
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const userId = session.user.id;

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: "Missing file upload" });
  }

  try {
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const slip = await verifySlipFromImage(base64Image);

    const { ref, receiver_name, amount } = slip.data;
    if (!ref || !receiver_name || !amount) throw new Error("ข้อมูลสลิปไม่สมบูรณ์");

    const cfg = await Config.findOne().select("payment.bank_account_name_en");
    const expectedName = cfg?.payment?.bank_account_name_en;

    if (normalize(receiver_name) !== normalize(expectedName)) {
      throw new Error("ชื่อผู้รับเงินไม่ตรงกัน");
    }

    const qr = await PromptQR.findOne({ ref });
    if (!qr) throw new Error("QR ไม่พบ");
    if (qr.used) throw new Error("QR ถูกใช้งานไปแล้ว");
    if (qr.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");
    if (parseFloat(amount) !== qr.amount) throw new Error("ยอดเงินไม่ตรงกับ QR");

    qr.used = true;
    await qr.save();

    await Topup.create({
      _id: uuidv4(),
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
    await Topup.create({
      _id: uuidv4(),
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

export const config = {
  api: {
    bodyParser: false, // ปิด body parser ของ Next.js เพราะ multer จะจัดการ
  },
};

export default apiRoute;
