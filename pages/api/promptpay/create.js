import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Config from "../../../models/config";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ success: false, message: "Amount is required and must be a number" });
  }

  // ดึงข้อมูล PromptPay ID และชื่อบัญชีจาก Config
  const config = await Config.findOne().select("payment.promptpay_id payment.account_name");
  if (!config?.payment?.promptpay_id || !config.payment.account_name) {
    return res.status(500).json({ success: false, message: "PromptPay ID หรือชื่อบัญชี ไม่ถูกตั้งค่า" });
  }
  const ppId = config.payment.promptpay_id;
  const merchantName = config.payment.account_name;

  // สร้าง ref และตั้งเวลาใช้งาน
  const ref = uuidv4().slice(0, 8);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const note = `Ref:${ref}|Exp:${expiresAt.toISOString()}`;

  // สร้าง payload PromptPay
  const payload = generatePayload(ppId, { amount: parseFloat(amount), info: note });

  // แปลง payload เป็น QR Code DataURL
  const qrDataUrl = await QRCode.toDataURL(payload);

  // เก็บข้อมูล QR ใน DB
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
