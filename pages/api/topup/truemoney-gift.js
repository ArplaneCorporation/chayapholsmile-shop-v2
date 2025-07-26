import dbConnect from "../../../lib/db-connect";
import Topup from "../../../models/topup";
import User from "../../../models/user";
import { isAuthenticatedUser } from "../../../middlewares/auth";

// ฟังก์ชันแลกรับ TrueMoney Gift
async function redeemvouchers(phone, input) {
  const code = input.includes("v=") ? input.split("v=")[1].split("&")[0].trim() : input.trim();

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

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { gift_url, phone } = req.body;

    if (!gift_url || typeof gift_url !== "string") {
      return res.status(400).json({ success: false, message: "กรุณาส่ง gift_url ให้ถูกต้อง" });
    }

    const code = gift_url.includes("v=")
      ? gift_url.split("v=")[1].split("&")[0].trim()
      : gift_url.trim();

    if (!code) {
      return res.status(400).json({ success: false, message: "โค้ดไม่ถูกต้อง" });
    }

    // หาผู้ใช้จาก email ใน session.user
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    const targetPhone = phone || user.phone || "0901234567";

    const result = await redeemvouchers(targetPhone, code);

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

// ห่อ handler ด้วย middleware
export default isAuthenticatedUser(handler);
