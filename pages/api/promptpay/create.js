import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import promptpay from "promptparse";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Config from "../../../models/config";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  try {
    // ดึงข้อมูล PromptPay ID จาก config collection
    const config = await Config.findOne();
    if (!config || !config.payment || !config.payment.promptpay_id) {
      return res.status(500).json({ success: false, message: "PromptPay ID not configured" });
    }

    const promptpayId = config.payment.promptpay_id;

    const ref = uuidv4().slice(0, 8); // สร้าง ref แบบสั้น
    const expiresAt = new Date(Date.now() + 10 * 60000); // หมดอายุใน 10 นาที

    // ฝัง description (ใส่ ref กับ expiresAt ลงไปใน message)
    const note = `Ref:${ref}|Exp:${expiresAt.toISOString()}`;

    // สร้าง payload QR code
    const payload = promptpay.generate({
      receiver: promptpayId,
      amount: parseFloat(amount),
      message: note,
    });

    const qrDataUrl = await QRCode.toDataURL(payload);

    // บันทึกข้อมูล QR เพื่อใช้ตรวจสอบและจำกัดการใช้
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
