import { IncomingForm } from "formidable";
import fs from "fs";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Topup from "../../../models/topup";
import Config from "../../../models/config";

export const config = { api: { bodyParser: false } };

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

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ success: false, message: "Parse error" });

    const { user } = fields;
    const file = files.file;

    if (!user || !file) {
      return res.status(400).json({ success: false, message: "Missing user or file" });
    }

    try {
      const imageData = fs.readFileSync(file.filepath, { encoding: "base64" });
      const base64Image = `data:image/png;base64,${imageData}`;

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

      // สำเร็จ
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
        user,
        reference: "unknown",
        type: "promptpay",
        method: "promptpay",
        amount: 0,
        status: "failed",
        verifyNote: e.message,
        createdAt: new Date(),
      });
      return res.status(400).json({ success: false, message: e.message });
    }
  });
}
