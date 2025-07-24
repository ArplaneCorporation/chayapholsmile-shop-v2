const { phone, gift_url } = req.body;

// ดึง token จาก URL gift_url เช่น ?v=...
const urlObj = new URL(gift_url);
const token = urlObj.searchParams.get("v");

if (!token) {
    return res.status(400).json({
        success: false,
        message: "ลิงก์ไม่ถูกต้อง ไม่มี token 'v' ใน URL",
    });
}

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    10
);

const wallet = new TrueWallet(phone);

const redeemed = await wallet.redeem(token); // ส่งแค่ token ไป redeem

if (!redeemed) {
    return res.status(406).json({
        success: false,
        message: "ลิงก์นี้ถูกใช้งานไปแล้ว",
    });
}

// สร้างรายการ topup
const topup = await Topup.create({
    _id: nanoid(),
    type: "TRUEMONEY_GIFT",
    amount: redeemed.amount,
    reference: gift_url,  // เก็บทั้งลิงก์ไว้
    user: req.user.id,
});

// อัพเดต point ผู้ใช้
const newPoint = req.user.point + redeemed.amount;
const user = await User.findById(req.user.id);
user.point = newPoint;
await user.save({ validateBeforeSave: false });

return res.status(200).json({
    success: true,
    topup,
});
