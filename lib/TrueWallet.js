import { fetch } from "undici";
import tls from "tls";
tls.DEFAULT_MIN_VERSION = "TLSv1.3";

class TrueWallet {
    constructor(phoneNumber) {
        if (!phoneNumber || phoneNumber.length !== 10) {
            throw new Error("Please provide a phone number 10 digits");
        }
        this.phoneNumber = phoneNumber;
    }

    async redeem(code) {
        try {
            let urlParts = (code += "").split("v=");
            code = (urlParts[1] || urlParts[0]).match(/[0-9A-Za-z]+/)[0];

            if (code.length !== 18) {
                return { success: false, message: "ลิงก์ไม่ถูกต้อง" };
            }

            const response = await fetch(
                `https://gift.truemoney.com/campaign/vouchers/${code}/redeem`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobile: this.phoneNumber,
                        voucher_hash: code,
                    }),
                }
            );

            const result = await response.json();

            if (result.status?.code === "SUCCESS") {
                return {
                    success: true,
                    amount: Number(
                        result.data.my_ticket.amount_baht.replace(/,/g, "")
                    ),
                    owner_name: result.data.owner_profile.full_name,
                    code,
                };
            } else {
                return {
                    success: false,
                    message: result.status?.message || "ไม่สามารถแลกรับได้",
                };
            }
        } catch (err) {
            console.error("TrueWallet redeem error:", err);
            return {
                success: false,
                message: "เกิดข้อผิดพลาดขณะติดต่อเซิร์ฟเวอร์ TrueMoney",
            };
        }
    }

    generate_crc() {}
}

export default TrueWallet;