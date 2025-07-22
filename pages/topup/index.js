import { useSession } from "next-auth/react";
import Image from "next/image";
import { useContext, useState } from "react";
import Layout from "../../components/layouts/main-layout";
import RedeemCouponTab from "../../components/tabs/topup-coupon";
import TrueMoneyGiftTab from "../../components/tabs/topups-truemoney-gift";
import TopupCard from "../../components/ui/cards/topup-card";
import ConfigContext from "../../contexts/config/config-context";

const Topup = ({ configs }) => {
  const [activeTab, setActiveTab] = useState(
    configs.payment?.truemoney_gift ? "twGift" : "coupon"
  );
  const [amount, setAmount] = useState("");
  const [refNbr, setRefNbr] = useState("");
  const [slipImage, setSlipImage] = useState(null);
  const [slipResult, setSlipResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [topupStatus, setTopupStatus] = useState(""); // 'success' | 'failed' | ''
  const [topupMessage, setTopupMessage] = useState("");

  const handleTab = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
    setSlipResult(null);
    setTopupStatus("");
    setTopupMessage("");
  };

  const handleVerifySlip = async () => {
    setVerifying(true);
    setSlipResult(null);
    setTopupStatus("");
    setTopupMessage("");
    try {
      const response = await fetch("https://api.openslipverify.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refNbr,
          amount,
          token: "7bc437fa-cb4c-4c8c-ab93-c737ca7aebc7",
        }),
      });
      const data = await response.json();
      setSlipResult(data);

      if (data.success) {
        // ดึงข้อมูลจาก API
        const { sender, receiver, amount, transDate, transTime } = data.data;

        // บันทึกการเติมเงินไปยังระบบเดิม
        try {
          const saveResponse = await fetch("/api/topup/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              method: "PromptPay",
              amount: amount,
              ref: refNbr,
              data: {
                sender: sender.displayName,
                receiver: receiver.displayName,
                datetime: `${transDate}T${transTime}`,
              },
            }),
          });
          const result = await saveResponse.json();
          if (result.success) {
            setTopupStatus("success");
            setTopupMessage("เติมเงินสำเร็จ และบันทึกเรียบร้อยแล้ว");
          } else {
            setTopupStatus("failed");
            setTopupMessage("บันทึกไม่สำเร็จ: " + result.message);
          }
        } catch (err) {
          setTopupStatus("failed");
          setTopupMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
          console.error(err);
        }
      } else {
        setTopupStatus("failed");
        setTopupMessage(data.msg || "ตรวจสอบสลิปไม่สำเร็จ");
      }
    } catch (error) {
      setTopupStatus("failed");
      setTopupMessage("เกิดข้อผิดพลาดในการตรวจสอบสลิป");
      console.error(error);
    }
    setVerifying(false);
  };

  return (
    <Layout>
      <main className="max-w-[1150px] px-4 sm:px-[25px] pb-4 sm:pb-[25px] pt-20 md:pt-28 mx-auto items-center">
        <section
          id="header"
          className="md:hidden border-b-2 mx-8 py-4 mb-6"
        >
          <h1 className="text-4xl font-semibold text-center">เติมเงิน</h1>
        </section>
        <section className="md:grid md:grid-cols-3 md:gap-4">
          <div id="tab-select" className="md:col-span-1 mb-4 md:mb-0">
            <div className="flex flex-col gap-1.5 p-4 md:sticky md:top-[100px] bg-white border shadow rounded-md">
              {configs.payment?.truemoney_gift && (
                <div
                  onClick={(e) => handleTab(e, "twGift")}
                  className={`flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 hover:cursor-pointer ${
                    activeTab === "twGift" && `bg-primary/10 text-primary`
                  }`}
                >
                  <div className="w-16 aspect-square relative">
                    <Image
                      alt="topup_image"
                      src="/pictures/truemoney.png"
                      fill
                      className="select-none object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">TrueMoney Wallet Gift</h3>
                    <p className="text-sm">เติมเงินด้วย TrueMoney Wallet Gift</p>
                  </div>
                </div>
              )}
              {configs.payment?.truemoney_qr && (
                <div
                  onClick={(e) => handleTab(e, "twQR")}
                  className={`flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 hover:cursor-pointer ${
                    activeTab === "twQR" && `bg-primary/10 text-primary`
                  }`}
                >
                  <div className="w-16 aspect-square relative">
                    <Image
                      alt="topup_image"
                      src="/pictures/truemoney.png"
                      fill
                      className="select-none object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">TrueMoney Wallet QR</h3>
                    <p className="text-sm">เติมเงินด้วย TrueMoney Wallet QR</p>
                  </div>
                </div>
              )}
              {configs.payment?.promptpay_qr && (
                <div
                  onClick={(e) => handleTab(e, "promptpay")}
                  className={`flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 hover:cursor-pointer ${
                    activeTab === "promptpay" && `bg-primary/10 text-primary`
                  }`}
                >
                  <div className="w-16 aspect-square relative">
                    <Image
                      alt="topup_image"
                      src="/pictures/promptpay.png"
                      fill
                      className="select-none object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">PromptPay</h3>
                    <p className="text-sm">เติมเงินผ่านพร้อมเพย์ (QR Code)</p>
                  </div>
                </div>
              )}
              <div
                onClick={(e) => handleTab(e, "coupon")}
                className={`flex items-center gap-4 p-2 rounded-lg hover:bg-primary/10 hover:cursor-pointer ${
                  activeTab === "coupon" && `bg-primary/10 text-primary`
                }`}
              >
                <div className="w-16 aspect-square relative">
                  <Image
                    alt="topup_image"
                    src="/pictures/coupon.png"
                    fill
                    className="select-none object-cover"
                  />
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
          >
            {activeTab === "twGift" && <TrueMoneyGiftTab />}
            {activeTab === "coupon" && <RedeemCouponTab />}

            {activeTab === "promptpay" && (
              <>
                <label>จำนวนเงิน (บาท):</label>
                <input
                  type="number"
                  className="border rounded p-2"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="เช่น 100"
                />

                {amount && configs.payment?.promptpay_id && (
                  <div className="mt-4 text-center">
                    <p className="mb-2">QR PromptPay:</p>
                    <img
                      src={`https://promptpay.io/${configs.payment.promptpay_id}/${amount}`}
                      alt="PromptPay QR"
                      className="w-60 h-60 mx-auto"
                    />
                  </div>
                )}

                <hr className="my-4" />

                <label>แนบสลิป (รูปภาพ):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSlipImage(e.target.files[0])}
                />

                <label>รหัส QR จากสลิป (refNbr):</label>
                <input
                  type="text"
                  className="border rounded p-2"
                  value={refNbr}
                  onChange={(e) => setRefNbr(e.target.value)}
                  placeholder="คัดลอกจาก QR บนสลิป"
                />

                <button
                  type="button"
                  onClick={handleVerifySlip}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
                  disabled={verifying}
                >
                  {verifying ? "กำลังตรวจสอบ..." : "ตรวจสอบสลิป"}
                </button>

                {topupStatus === "success" && (
                  <p className="text-green-600 font-semibold mt-4">{topupMessage}</p>
                )}

                {topupStatus === "failed" && (
                  <p className="text-red-600 font-semibold mt-4">{topupMessage}</p>
                )}

                {slipResult && slipResult.success === false && (
                  <div className="mt-4 p-2 bg-red-100 rounded">
                    <p className="text-red-700">{slipResult.msg}</p>
                  </div>
                )}
              </>
            )}
          </form>
        </section>
      </main>
    </Layout>
  );
};

export default Topup;

Topup.auth = true;

export { getServerSideProps } from "../../utils/get-init-data";
