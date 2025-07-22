import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr"; // ✅ ใช้ default import (เฉพาะ v1.0.6)

import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Config from "../../../models/config"; // ← เก็บ promptpay_id

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const config = await Config.findOne({});
    if (!config || !config.payment || !config.payment.promptpay_id) {
      return res.status(500).json({ success: false, message: "PromptPay ID not configured" });
    }

    const ref = uuidv4().slice(0, 8);
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 นาที
    const payload = generatePayload(config.payment.promptpay_id, {
      amount: parseFloat(amount),
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
  } catch (error) {
    console.error("QR Create Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}