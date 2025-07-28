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

// สร้าง handler
const handler = nc({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end('Internal server error');
  },
  onNoMatch: (req, res) => {
    res.status(405).end('Method not allowed');
  }
});

// ใช้ middleware
handler.use(upload.single('file'));

handler.post(async (req, res) => {
  await dbConnect();

  try {
    const session = await getServerSession(req, res, authOptions(req));
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // ส่วนที่เหลือของโค้ดเดิม...
    // ... (โค้ดการประมวลผลไฟล์และบันทึกข้อมูล)

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
