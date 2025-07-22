import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import promptpay from "promptparse";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  const ref = uuidv4().slice(0, 8); // unique ref
  const expiresAt = new Date(Date.now() + 10 * 60000); // หมดอายุใน 10 นาที

  // ฝัง description
  const note = `Ref:${ref}|Exp:${expiresAt.toISOString()}`;
  const payload = promptpay.generate({
    receiver: "0812345678", // เปลี่ยนเป็น PromptPay ID จริงของคุณ
    amount: parseFloat(amount),
    message: note,
  });

  const qrDataUrl = await QRCode.toDataURL(payload);

  // บันทึกข้อมูล QR เพื่อเช็คว่าใช้ไปหรือยัง
  await PromptQR.create({
    ref,
    amount: parseFloat(amount),
    expiresAt,
    used: false,
  });

  return res.status(200).json({
    success: true,
    ref,
    expiresAt,
    qr: qrDataUrl,
  });
}
