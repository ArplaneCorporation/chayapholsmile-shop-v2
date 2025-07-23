import dbConnect from "../../../lib/db-connect";
import Topup from "../../../models/topup";
import User from "../../../models/user";
import { customAlphabet } from "nanoid";
import TrueWallet from "../../../lib/TrueWallet";
import { isAuthenticatedUser } from "../../../middlewares/auth";

async function handler(req, res) {
    await dbConnect();

    switch (req.method) {
        case "POST":
            try {
                const { phone, gift_url } = req.body;

                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: "คุณยังไม่ได้เข้าสู่ระบบ",
                    });
                }

                const nanoid = customAlphabet(
                    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                    10
                );

                const wallet = new TrueWallet(phone);
                const redeemed = await wallet.redeem(gift_url);

                if (!redeemed.success) {
                    return res.status(406).json({
                        success: false,
                        message: redeemed.message || "ลิงก์นี้ถูกใช้งานไปแล้ว",
                    });
                }

                const topup = await Topup.create({
                    _id: nanoid(),
                    type: "TRUEMONEY_GIFT",
                    amount: redeemed.amount,
                    reference: gift_url,
                    user: req.user.id,
                });

                const user = await User.findById(req.user.id);
                user.point += redeemed.amount;
                await user.save({ validateBeforeSave: false });

                return res.status(200).json({
                    success: true,
                    topup,
                });
            } catch (error) {
                console.error("Topup Error:", error);
                res.status(500).json({
                    success: false,
                    message: "ไม่สามารถดำเนินการได้",
                });
            }
        default:
            return res.status(405).json({
                success: false,
                message: "Method not allowed.",
            });
    }
}

export default isAuthenticatedUser(handler);