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

  const ref = uuidv4().slice(0, 8);
  const expiresAt = new Date(Date.now() + 10 * 60000);

  const note = `Ref:${ref}|Exp:${expiresAt.toISOString()}`;

  // ใช้ generatePayload แทน generate
  const payload = promptpay.generatePayload({
    receiver: "0812345678", // เปลี่ยนเป็น PromptPay ID ของคุณ
    amount: parseFloat(amount),
    message: note,
  });

  const qrDataUrl = await QRCode.toDataURL(payload);

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
