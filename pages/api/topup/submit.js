// ตรวจสอบก่อนบันทึก
const record = await PromptQR.findOne({ ref });

if (!record) throw new Error("ไม่พบข้อมูล QR นี้");
if (record.used) throw new Error("QR นี้ถูกใช้ไปแล้ว");
if (record.expiresAt < new Date()) throw new Error("QR หมดอายุแล้ว");

// mark as used
record.used = true;
await record.save();
