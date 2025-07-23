import { useState } from "react";
import Image from "next/image";
import Layout from "../../components/layouts/main-layout";
import RedeemCouponTab from "../../components/tabs/topup-coupon";
import TrueMoneyGiftTab from "../../components/tabs/topups-truemoney-gift";
import { useSession } from "next-auth/react";

const Topup = ({ configs }) => {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState(
    configs.payment?.truemoney_gift ? "twGift" : "coupon"
  );
  const [amount, setAmount] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrRef, setQrRef] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [slipImage, setSlipImage] = useState(null);
  const [topupStatus, setTopupStatus] = useState("");
  const [topupMessage, setTopupMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleTab = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    setTopupStatus("");
    setTopupMessage("");
    setQrDataUrl(null);
    setQrRef(null);
  };

  const fetchPromptPayQr = async (amt) => {
    if (!amt || amt <= 0) {
      setQrDataUrl(null);
      setQrRef(null);
      return;
    }
    try {
      const res = await fetch("/api/promptpay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (data.success) {
        setQrDataUrl(data.qr);
        setQrRef(data.ref);
        setQrExpiresAt(data.expiresAt);
      } else {
        setTopupStatus("failed");
        setTopupMessage("ไม่สามารถสร้าง QR ได้: " + (data.message || "เกิดข้อผิดพลาด"));
        setQrDataUrl(null);
        setQrRef(null);
      }
    } catch (error) {
      setTopupStatus("failed");
      setTopupMessage("เกิดข้อผิดพลาดในการสร้าง QR");
      setQrDataUrl(null);
      setQrRef(null);
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    fetchPromptPayQr(val);
    setTopupStatus("");
    setTopupMessage("");
  };

  const handleSlipChange = (e) => {
    setSlipImage(e.target.files[0]);
    setTopupStatus("");
    setTopupMessage("");
  };

  const handleSubmitTopup = async () => {
    if (!session?.user?._id) {
      setTopupStatus("failed");
      setTopupMessage("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    if (!amount || !qrRef) {
      setTopupStatus("failed");
      setTopupMessage("กรุณากรอกจำนวนเงินและสร้าง QR ก่อน");
      return;
    }
    if (!slipImage) {
      setTopupStatus("failed");
      setTopupMessage("กรุณาแนบรูปสลิปโอนเงิน");
      return;
    }

    setVerifying(true);
    setTopupStatus("");
    setTopupMessage("");

    const formData = new FormData();
    formData.append("method", "promptpay");
    formData.append("type", "promptpay"); // 💡 ใช้เป็นประเภทเติมเงิน
    formData.append("user", session.user._id); // 💡 ส่ง user id ไปให้ backend
    formData.append("amount", amount);
    formData.append("reference", qrRef);
    formData.append("slip", slipImage);

    try {
      const res = await fetch("/api/topup/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setTopupStatus("success");
        setTopupMessage("เติมเงินสำเร็จและบันทึกเรียบร้อยแล้ว");
        setAmount("");
        setSlipImage(null);
        setQrDataUrl(null);
        setQrRef(null);
      } else {
        setTopupStatus("failed");
        setTopupMessage("บันทึกไม่สำเร็จ: " + (data.message || "เกิดข้อผิดพลาด"));
      }
    } catch (error) {
      setTopupStatus("failed");
      setTopupMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(error);
    }

    setVerifying(false);
  };

  const tabClass = (tab) =>
    `flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 hover:cursor-pointer ${
      activeTab === tab ? "bg-primary/10 text-primary" : ""
    }`;

  return (
    <Layout>
      <main className="max-w-[1150px] px-4 sm:px-[25px] pb-4 sm:pb-[25px] pt-20 md:pt-28 mx-auto items-center">
        <section id="header" className="md:hidden border-b-2 mx-8 py-4 mb-6">
          <h1 className="text-4xl font-semibold text-center">เติมเงิน</h1>
        </section>

        <section className="md:grid md:grid-cols-3 md:gap-4">
          <div id="tab-select" className="md:col-span-1 mb-4 md:mb-0">
            <div className="flex flex-col gap-1.5 p-4 md:sticky md:top-[100px] bg-white border shadow rounded-md">
              {configs.payment?.truemoney_gift && (
                <div onClick={(e) => handleTab(e, "twGift")} className={tabClass("twGift")}>
                  <div className="w-16 aspect-square relative">
                    <Image alt="topup_image" src="/pictures/truemoney.png" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium">TrueMoney Wallet Gift</h3>
                    <p className="text-sm">เติมเงินด้วย TrueMoney Wallet Gift</p>
                  </div>
                </div>
              )}
              {configs.payment?.promptpay_qr && (
                <div onClick={(e) => handleTab(e, "promptpay")} className={tabClass("promptpay")}>
                  <div className="w-16 aspect-square relative">
                    <Image alt="topup_image" src="/pictures/promptpay.png" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium">PromptPay</h3>
                    <p className="text-sm">เติมเงินผ่านพร้อมเพย์ (QR Code)</p>
                  </div>
                </div>
              )}
              <div onClick={(e) => handleTab(e, "coupon")} className={tabClass("coupon")}>
                <div className="w-16 aspect-square relative">
                  <Image alt="topup_image" src="/pictures/coupon.png" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium">Redeem Coupon Code</h3>
                  <p className="text-sm">แลกคูปอง</p>
                </div>
              </div>
            </div>
          </div>

          <form
            id="tab"
            autoComplete="off"
            className="md:col-span-2 bg-white border rounded-md shadow p-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitTopup();
            }}
          >
            {activeTab === "twGift" && <TrueMoneyGiftTab />}
            {activeTab === "coupon" && <RedeemCouponTab />}
            {activeTab === "promptpay" && (
              <>
                <label>จำนวนเงิน (บาท):</label>
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  className="border rounded p-2"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="เช่น 100"
                />

                {qrDataUrl && (
                  <div className="mt-4 text-center">
                    <p className="mb-2">
                      QR PromptPay (หมดอายุ: {new Date(qrExpiresAt).toLocaleTimeString()})
                    </p>
                    <img src={qrDataUrl} alt="PromptPay QR" className="w-60 h-60 mx-auto" />
                  </div>
                )}

                <label>แนบสลิป (รูปภาพ):</label>
                <input type="file" accept="image/*" onChange={handleSlipChange} />

                <button
                  type="submit"
                  disabled={verifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
                >
                  {verifying ? "กำลังบันทึก..." : "บันทึกการเติมเงิน"}
                </button>

                {topupStatus === "success" && (
                  <p className="text-green-600 font-semibold mt-4">{topupMessage}</p>
                )}
                {topupStatus === "failed" && (
                  <p className="text-red-600 font-semibold mt-4">{topupMessage}</p>
                )}
              </>
            )}
          </form>
        </section>
      </main>
    </Layout>
  );
};

Topup.auth = true;
export { getServerSideProps } from "../../utils/get-init-data";
export default Topup;