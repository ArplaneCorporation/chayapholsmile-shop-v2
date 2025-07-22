export default async function handler(req, res) {
  // อย่าทำ await นอกฟังก์ชันนี้
  await dbConnect();

  try {
    const record = await PromptQR.findOne({ ref });

    if (!record) throw new Error("ไม่พบข้อมูล QR นี้");
    if (record.used) throw new Error("QR นี้ถูกใช้ไปแล้ว");
    if (record.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");

    record.used = true;
    await record.save();

    res.status(200).json({ success: true, message: "บันทึกสำเร็จ" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
