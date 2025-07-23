import { fetch } from "undici";
import tls from "tls";
tls.DEFAULT_MIN_VERSION = "TLSv1.3";

class TrueWallet {
    constructor(phoneNumber) {
        if (!phoneNumber || phoneNumber.length != 10)
            throw new Error("Please provide a phone number 10 digits");
        this.phoneNumber = phoneNumber;
    }

    async redeem(code) {
        code = (code += "").split("v=")[1] || code;
        code = code.match(/[0-9A-Za-z]{32,36}/)?.[0];
        if (!code) throw new Error("ลิงก์ไม่ถูกต้อง");

        try {
            const res = await fetch(
                `https://gift.truemoney.com/campaign/vouchers/${code}/redeem`,
                {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        mobile: this.phoneNumber,
                        voucher_hash: code,
                    }),
                }
            );

            const o = await res.json();

            if (o.status?.code === "SUCCESS")
                return {
                    amount: Number(o.data.my_ticket.amount_baht.replace(/,/g, "")),
                    owner_name: o.data.owner_profile.full_name,
                    code,
                };
            else
                throw new Error(o.status?.message || "ลิงก์นี้ถูกใช้ไปแล้ว");
        } catch (err) {
            throw new Error(err.message || "เกิดข้อผิดพลาด");
        }
    }

    generate_crc() {}
}

export default TrueWallet;
