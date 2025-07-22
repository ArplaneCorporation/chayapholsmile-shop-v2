import { IncomingForm } from "formidable";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Topup from "../../../models/topup";
import Config from "../../../models/config";

export const config = { api: { bodyParser: false } };

async function verifySlipOpenSlip(refNbr, amount) {
  const resp = await fetch("https://api.openslipverify.com/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refNbr, amount: String(amount), token: process.env.OPENSLIPVERIFY_TOKEN }),
  });
  return resp.json();
}

function matchReceiver(name, dbTh, dbEn) {
  if (!name) return false;
  const norm = name.replace(/\s+/g, "").toLowerCase();
  if (dbTh && norm.includes(dbTh.replace(/\s+/g, "").toLowerCase())) return true;
  if (dbEn) {
    const prefix = dbEn.split(" ")[0].toLowerCase();
    return norm.includes(prefix);
  }
  return false;
}

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const form = new IncomingForm();
  form.parse(req, async (err, fields) => {
    if (err) return res.status(400).json({ success: false, message: "Parse error" });

    const { amount, ref, user } = fields;
    if (!amount || !ref || !user) return res.status(400).json({ success: false, message: "Incomplete data" });

    try {
      const qr = await PromptQR.findOne({ ref });
      if (!qr) throw new Error("QR not found");
      if (qr.used) throw new Error("QR already used");
      if (qr.expiresAt < new Date()) throw new Error("QR expired");
      if (parseFloat(amount) !== qr.amount) throw new Error("Amount mismatch");

      const result = await verifySlipOpenSlip(ref, parseFloat(amount));
      if (!result.success) throw new Error(result.msg || "Slip not verified");

      const cfg = await Config.findOne().select("payment.bank_account_th payment.bank_account_en");
      const ok = matchReceiver(result.data.receiver.name, cfg?.payment?.bank_account_th, cfg?.payment?.bank_account_en);
      if (!ok) throw new Error("Receiver name mismatch");

      qr.used = true;
      await qr.save();

      await Topup.create({
        user,
        reference: ref,
        type: "promptpay",
        method: "promptpay",
        amount: qr.amount,
        status: "success",
        verifyNote: "",
        createdAt: new Date(),
      });

      return res.status(200).json({ success: true, message: "เติมเงินสำเร็จ" });
    } catch (e) {
      await Topup.create({
        user: user,
        reference: ref,
        type: "promptpay",
        method: "promptpay",
        amount: parseFloat(amount),
        status: "failed",
        verifyNote: e.message,
        createdAt: new Date(),
      });
      return res.status(400).json({ success: false, message: e.message });
    }
  });
}