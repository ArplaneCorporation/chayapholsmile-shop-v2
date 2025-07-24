import dbConnect from "../../../lib/db-connect";
import Topup from "../../../models/topup";
import User from "../../../models/user";
import { isAuthenticatedUser } from "../../../middlewares/auth";

// ฟังก์ชัน redeemvouchers รวมไว้ในนี้เลย
async function redeemvouchers(phone, input) {
  // ตัดโค้ดจากลิงก์ หรือรับโค้ดตรง ๆ
  let code = input.includes("v=") ? input.split("v=")[1].trim() : input.trim();

  const headers = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0",
  };

  try {
    const res = await fetch(`https://gift.truemoney.com/campaign/vouchers/${code}/redeem`, {
      method: "POST",
      headers,
      body: JSON.stringify({ mobile: phone, voucher_hash: code }),
    });

    const data = await res.json();

    if (data.status.code === "SUCCESS") {
      return { status: "SUCCESS", amount: Number(data.data.voucher.amount_baht) };
    } else if (data.status.code === "VOUCHER_OUT_OF_STOCK") {
      return { status: "FAIL", reason: "Voucher out of stock" };
    } else if (data.status.code === "INVALID_VOUCHER") {
      return { status: "FAIL", reason: "Invalid Code" };
    } else if (data.status.code === "VOUCHER_ALREADY_REDEEMED") {
      return { status: "FAIL", reason: "Code already used" };
    }

    return { status: "FAIL", reason: data.status.message || "Unknown error" };
  } catch (err) {
    return { status: "ERROR", reason: err.message };
  }
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await isAuthenticatedUser(req, res);

    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ success: false, message: "กรุณาส่งรหัสหรือโค้ดเติมเงินให้ถูกต้อง" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    const phone = user.phone || "0901234567"; // ถ้าไม่มีเบอร์ใน DB กำหนดค่าเริ่มต้น

    const result = await redeemvouchers(phone, code);

    if (result.status !== "SUCCESS") {
      return res.status(400).json({ success: false, message: result.reason || "ไม่สามารถเติมเงินได้" });
    }

    const topup = await Topup.create({
      user: user._id,
      type: "truemoney_gift",
      amount: result.amount,
      code,
    });

    user.balance = (user.balance || 0) + result.amount;
    await user.save();

    return res.status(200).json({ success: true, message: "เติมเงินสำเร็จ", topup });
  } catch (error) {
    console.error("[truemoney-gift]", error);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
}
