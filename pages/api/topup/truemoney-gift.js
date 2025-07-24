async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const { phone, gift_url } = req.body;
    if (!phone || !gift_url) {
      return res.status(400).json({ success: false, message: "กรุณาส่ง phone และ gift_url ให้ครบถ้วน" });
    }

    const urlObj = new URL(gift_url);
    const token = urlObj.searchParams.get("v");

    if (!token) {
      return res.status(400).json({ success: false, message: "ลิงก์ไม่ถูกต้อง ไม่มี token 'v'" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "ผู้ใช้ไม่ได้ล็อกอินหรือ token หมดอายุ" });
    }

    const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);
    const wallet = new TrueWallet(phone);
    
    console.log("Redeeming token:", token);
    const redeemed = await wallet.redeem(token);
    console.log("Redeemed result:", redeemed);

    if (!redeemed) {
      return res.status(406).json({ success: false, message: "ลิงก์นี้ถูกใช้งานไปแล้ว" });
    }

    const topup = await Topup.create({
      _id: nanoid(),
      type: "TRUEMONEY_GIFT",
      amount: redeemed.amount,
      reference: gift_url,
      user: req.user.id,
    });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    user.point = (user.point || 0) + redeemed.amount;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, topup });
  } catch (error) {
    console.error("Error in /api/topup/gift:", error);
    return res.status(500).json({ success: false, message: "ไม่สามารถดำเนินการได้" });
  }
}
