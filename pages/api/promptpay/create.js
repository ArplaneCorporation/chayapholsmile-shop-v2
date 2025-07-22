import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import dbConnect from "../../../lib/db-connect";
import PromptQR from "../../../models/promptqr";
import Config from "../../../models/config";

// ฟังก์ชันช่วยสร้าง payload PromptPay
function createPromptPayPayload(id, amount, message) {
  // 1. สร้าง EMV payload ตามมาตรฐาน PromptPay
  // https://promptpay.io/ QR Code Spec
  
  // Format: ID, Length, Value ตาม spec
  // 00 - Payload Format Indicator = "01"
  // 01 - Point of Initiation Method = "12" (dynamic QR)
  // 29 - Merchant Account Information
  //    00 - GUI = "A000000677010111"
  //    01 - Mobile Number หรือ PromptPay ID (converted to format)
  // 52 - Merchant Category Code = "0000"
  // 53 - Transaction Currency = "764" (THB)
  // 54 - Transaction Amount (optional)
  // 58 - Country Code = "TH"
  // 59 - Merchant Name
  // 60 - Merchant City
  // 64 - Additional Data Field Template
  //    00 - Reference (Ref1)

  // ฟังก์ชันช่วยสร้างแต่ละ field
  const formatField = (id, value) => {
    const len = value.length.toString().padStart(2, "0");
    return id + len + value;
  };

  // แปลงหมายเลข PromptPay ให้เป็นรูปแบบ 0-9 digits เท่านั้น
  let ppId = id;
  if (ppId.startsWith("0")) {
    // เบอร์มือถือเริ่ม 0 ให้แปลงเป็นเลข 66 นำหน้า
    ppId = "66" + ppId.slice(1);
  } else if (ppId.length === 15 && ppId.startsWith("0")) {
    // กรณีอื่นๆ ตามต้องการ
  }
  // PromptPay จะเก็บหมายเลขใน Tag 01 ของ field 29

  // GUI ของ PromptPay (ตาม spec)
  const gui = "A000000677010111";

  // field 29 - Merchant Account Information (รวม 2 subfields)
  const merchantAccountInfo =
    formatField("00", gui) + // GUI
    formatField("01", ppId); // PromptPay ID แบบไม่มีเครื่องหมาย

  // field 64 - Additional Data Field Template (ใส่ ref)
  const additionalData =
    formatField("00", message); // ข้อมูล Ref, Exp ใส่ใน message

  // สร้าง Payload ตามลำดับ
  let payload =
    formatField("00", "01") + // Payload Format Indicator
    formatField("01", "12") + // Point of Initiation Method (12 = dynamic QR)
    formatField("29", merchantAccountInfo) +
    formatField("52", "0000") + // Merchant Category Code (ทั่วไป)
    formatField("53", "764") + // Currency THB
    (amount ? formatField("54", amount.toFixed(2)) : "") + // Amount (ถ้ามี)
    formatField("58", "TH") + // Country
    formatField("59", "CHAYAPHOL") + // Merchant Name (ตั้งเอง)
    formatField("60", "BKK") + // Merchant City (ตั้งเอง)
    formatField("64", additionalData);

  // คำนวณ CRC16 (MODBUS) สำหรับ checksum (ต้องมี 4 ตัวอักษรท้ายสุด)
  // https://en.wikipedia.org/wiki/Cyclic_redundancy_check
  function crc16(buffer) {
    let crc = 0xffff;
    for (let offset = 0; offset < buffer.length; offset++) {
      crc ^= buffer[offset];
      for (let bit = 0; bit < 8; bit++) {
        if ((crc & 1) !== 0) crc = (crc >> 1) ^ 0xA001;
        else crc = crc >> 1;
      }
    }
    return crc;
  }

  // แปลง string เป็น buffer (array of char codes)
  const buf = Buffer.from(payload + "6304"); // 63 = CRC Tag, 04 = length (4 bytes)

  const crc = crc16(buf);
  const crcStr = crc.toString(16).toUpperCase().padStart(4, "0");

  payload += "63" + "04" + crcStr;

  return payload;
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ success: false, message: "Amount is required and must be a number" });
  }

  // โหลด PromptPay ID จาก Config ในฐานข้อมูล
  const config = await Config.findOne().select("payment.promptpay_id");
  if (!config || !config.payment || !config.payment.promptpay_id) {
    return res.status(500).json({ success: false, message: "PromptPay ID ยังไม่ได้ตั้งค่าในระบบ" });
  }
  const promptpayId = config.payment.promptpay_id;

  const ref = uuidv4().slice(0, 8);
  const expiresAt = new Date(Date.now() + 10 * 60000);
  const message = `Ref:${ref}|Exp:${expiresAt.toISOString()}`;

  const payload = createPromptPayPayload(promptpayId, parseFloat(amount), message);
  const qrDataUrl = await QRCode.toDataURL(payload);

  await PromptQR.create({
    ref,
    amount: parseFloat(amount),
    expiresAt,
    used: false,
  });

  return res.status(200).json({
    success: true,
    ref,
    expiresAt,
    qr: qrDataUrl,
  });
}
