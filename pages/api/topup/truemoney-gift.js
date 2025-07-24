import dbConnect from "../../../lib/db-connect";
import Topup from "../../../models/topup";
import User from "../../../models/user";
import { customAlphabet } from "nanoid";
import TrueWallet from "../../../lib/TrueWallet";
import { isAuthenticatedUser } from "../../../middlewares/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await dbConnect();
    await isAuthenticatedUser(req, res);

    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    const wallet = new TrueWallet(req.user?.phoneNumber);
    const redeemResult = await wallet.redeem(code);

    if (!redeemResult || !redeemResult.amount) {
      return res.status(400).json({ success: false, message: "Failed to redeem code" });
    }

    const nanoid = customAlphabet("1234567890abcdef", 10);
    const ref = nanoid();

    // บันทึกลง Topup
    const topup = await Topup.create({
      user: req.user._id,
      type: "truemoney_gift",
      ref,
      amount: redeemResult.amount,
      status: "success",
    });

    // เพิ่มยอดเงินให้ user
    const user = await User.findById(req.user._id);
    user.balance += redeemResult.amount;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `เติมเงิน ${redeemResult.amount} บาท สำเร็จ`,
      topupId: topup._id,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error in /api/topup/gift:", error);

    let msg = "เกิดข้อผิดพลาดในการเติมเงิน";
    if (error.message?.startsWith("Sorry we cannot")) {
      msg = "โค้ดนี้ไม่สามารถใช้งานได้ หรือถูกใช้ไปแล้ว";
    }

    return res.status(500).json({ success: false, message: msg });
  }
}
