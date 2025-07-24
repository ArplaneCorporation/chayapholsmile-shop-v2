import dbConnect from "../../../lib/db-connect";
import Topup from "../../../models/topup";
import User from "../../../models/user";
import { isAuthenticatedUser } from "../../../middlewares/auth";
import truewallet from "../../../lib/apis/truewallet";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await isAuthenticatedUser(req, res);

    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "รหัสไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบแล้ว
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    const phone = process.env.TRUEWALLET_PHONE || "0901234567"; // ตั้งค่าหมายเลขโทรศัพท์ไว้ที่ .env

    const result = await truewallet.redeemvouchers(phone, code);

    if (result.status !== "SUCCESS") {
      return res.status(400).json({ success: false, message: result.reason || "ไม่สามารถเติมเงินได้" });
    }

    const { amount } = result;

    const topup = await Topup.create({
      user: user._id,
      type: "truemoney_gift",
      amount,
      code,
    });

    return res.status(200).json({ success: true, message: "เติมเงินสำเร็จ", topup });
  } catch (error) {
    console.error("[truemoney-gift]", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
