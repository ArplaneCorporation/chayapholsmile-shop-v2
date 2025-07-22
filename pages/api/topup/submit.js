import formidable from "formidable";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Topup from "../../../models/topup";
import Config from "../../../models/config";

export const config = { api: { bodyParser: false } };

// เรียก OpenSlipVerify API
async function verifySlipOpenSlip(refNbr, amount) {
  const resp = await fetch("https://api.openslipverify.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refNbr, amount: String(amount), token: process.env.OPENSLIPVERIFY_TOKEN }),
  });
  return resp.json();
}

// ฟังก์ชันเช็คชื่อ: ตรงหรือเป็น prefix ของนามสกุลภาษาอังกฤษ
function matchReceiver(receivedName, dbTh, dbEn) {
  if (!receivedName || (!dbTh && !dbEn)) return false;
  const norm = receivedName.replace(/\s+/g, "").toLowerCase();
  if (dbTh && norm.includes(dbTh.replace(/\s+/g, "").toLowerCase())) return true;
  if (dbEn) {
    const dbNorm = dbEn.split(" ")[0].toLowerCase();
    return norm.includes(dbNorm);
  }
  return false;
}

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields) => {
    if (err) return res.status(400).json({ success: false, message: "Upload error" });
    const { amount, ref } = fields;
    if (!amount || !ref) return res.status(400).json({ success: false, message: "Incomplete data" });

    try {
      const qr = await PromptQR.findOne({ ref });
      if (!qr) throw new Error("ไม่พบ QR นี้");
      if (qr.used) throw new Error("QR ถูกใช้งานแล้ว");
      if (qr.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");
      if (parseFloat(amount) !== qr.amount) throw new Error("ยอดเงินไม่ตรงกับ QR");

      const result = await verifySlipOpenSlip(ref, parseFloat(amount));
      if (!result.success) throw new Error(result.msg || "ไม่ผ่านการตรวจสอบสลิป");

      const config = await Config.findOne().select("payment.bank_account_th payment.bank_account_en");
      const okName = matchReceiver(
        result.data.receiver.name,
        config?.payment?.bank_account_th,
        config?.payment?.bank_account_en
      );
      if (!okName) throw new Error("ชื่อบัญชีผู้รับไม่ตรง");

      qr.used = true;
      await qr.save();

      await Topup.create({ method: "promptpay", amount: qr.amount, ref, status: "success", createdAt: new Date() });

      res.status(200).json({ success: true, message: "ตรวจสอบสลิปผ่าน ✓ เติมเงินสำเร็จ" });
    } catch (e) {
      await Topup.create({ method: "promptpay", amount: parseFloat(amount), ref, status: "failed", verifyNote: e.message, createdAt: new Date() });
      res.status(400).json({ success: false, message: e.message });
    }
  });
}