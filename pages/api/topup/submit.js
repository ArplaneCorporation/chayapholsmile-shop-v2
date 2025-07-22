import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await dbConnect();

  const { ref } = req.body;

  if (!ref) {
    return res.status(400).json({ success: false, message: "Missing ref" });
  }

  try {
    const record = await PromptQR.findOne({ ref });

    if (!record) throw new Error("ไม่พบข้อมูล QR นี้");
    if (record.used) throw new Error("QR นี้ถูกใช้ไปแล้ว");
    if (record.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");

    record.used = true;
    await record.save();

    return res.status(200).json({ success: true, message: "บันทึกสำเร็จ" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
