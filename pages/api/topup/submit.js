import nc from 'next-connect';
import multer from 'multer';
import { nanoid } from 'nanoid';
import dbConnect from '../../../lib/db-connect';
import PromptQR from '../../../models/promptqr';
import Topup from '../../../models/topup';
import Config from '../../../models/config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// ตั้งค่า Multer สำหรับ Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// ฟังก์ชันตรวจสอบสลิป
async function verifySlipFromImage(imgBase64) {
  const response = await fetch('https://slip-c.oiioioiiioooioio.download/api/slip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ img: imgBase64 })
  });

  if (!response.ok) {
    throw new Error('Failed to verify slip: ' + await response.text());
  }

  return response.json();
}

// ฟังก์ชัน normalize ชื่อ
function normalizeName(name) {
  return name?.replace(/\s+/g, '').toLowerCase() || '';
}

// สร้าง handler
const handler = nc({
  onError: (err, req, res) => {
    console.error('API Error:', err);
    res.status(500).json({ 
      success: false, 
      message: `Internal server error: ${err.message}` 
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ 
      success: false, 
      message: `Method '${req.method}' Not Allowed` 
    });
  }
});

// ใช้ middleware
handler.use(upload.single('file'));

handler.post(async (req, res) => {
  try {
    // เชื่อมต่อฐานข้อมูล
    await dbConnect();

    // ตรวจสอบ session
    const session = await getServerSession(req, res, authOptions(req));
    if (!session?.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // ตรวจสอบไฟล์
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    // แปลงไฟล์เป็น base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // ตรวจสอบสลิป
    const slipData = await verifySlipFromImage(base64Image);
    const { ref, receiver_name, amount } = slipData.data;

    if (!ref || !receiver_name || !amount) {
      throw new Error("Invalid slip data");
    }

    // ดึงข้อมูลบัญชีจาก Config
    const config = await Config.findOne().select("payment.bank_account_name_en");
    const expectedName = config?.payment?.bank_account_name_en;

    // ตรวจสอบชื่อผู้รับเงิน
    if (normalizeName(receiver_name) !== normalizeName(expectedName)) {
      throw new Error("Receiver name does not match");
    }

    // ตรวจสอบ QR Code
    const qr = await PromptQR.findOne({ ref });
    if (!qr) throw new Error("QR not found");
    if (qr.used) throw new Error("QR already used");
    if (qr.expiresAt < new Date()) throw new Error("QR expired");
    if (parseFloat(amount) !== qr.amount) throw new Error("Amount mismatch");

    // อัปเดตสถานะ QR
    qr.used = true;
    await qr.save();

    // บันทึกการเติมเงิน
    await Topup.create({
      _id: nanoid(10),
      user: session.user.id,
      reference: ref,
      type: "PROMPTPAY",
      amount: qr.amount,
      status: "success",
      verifyNote: "",
      createdAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      message: "เติมเงินสำเร็จ",
      amount: qr.amount
    });

  } catch (error) {
    console.error('Transaction Error:', error);

    // บันทึกข้อผิดพลาด (ถ้ามี session)
    if (session?.user?.id) {
      await Topup.create({
        _id: nanoid(10),
        user: session.user.id,
        reference: "unknown",
        type: "PROMPTPAY",
        amount: 0,
        status: "failed",
        verifyNote: error.message,
        createdAt: new Date()
      });
    }

    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
