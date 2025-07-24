import dbConnect from "../../../lib/db-connect";
import User from "../../../models/user";
import { isAuthenticatedUser } from "../../../middlewares/auth";

const handler = async (req, res) => {
    await dbConnect();

    switch (req.method) {
        case "GET":
            try {
                const user = await User.findById(req.user.id);
                res.status(200).json({ success: true, user });
            } catch (error) {
                res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            break;

        case "PATCH":
            try {
                const { username, email, avatar, confirmPassword } = req.body;

                const user = await User.findById(req.user.id).select("+password");
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "ไม่พบผู้ใช้",
                    });
                }

                // ตรวจสอบรหัสผ่านยืนยัน
                const isPasswordMatched = await user.comparePassword(confirmPassword);
                if (!isPasswordMatched) {
                    return res.status(400).json({
                        success: false,
                        message: "ยืนยันรหัสผ่านไม่ถูกต้อง",
                    });
                }

                // ตรวจสอบชื่อผู้ใช้ซ้ำ (ยกเว้นตัวเอง)
                const existingUser = await User.findOne({ username });
                if (existingUser && existingUser._id.toString() !== req.user.id) {
                    return res.status(400).json({
                        success: false,
                        message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว",
                    });
                }

                // อัปเดตข้อมูล
                user.username = username;
                user.email = email;
                user.avatar = avatar;

                await user.save();

                res.status(200).json({ success: true, user });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
            break;

        default:
            res.status(405).json({
                success: false,
                message: "Method not allowed",
            });
            break;
    }
};

export default isAuthenticatedUser(handler);
