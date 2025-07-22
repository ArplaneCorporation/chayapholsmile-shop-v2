import { useState, useEffect } from "react";
import { useToast } from "../../contexts/toast/toast-context";
import { HiOutlineCreditCard } from "react-icons/hi2";
import { FaMobileAlt, FaQrcode } from "react-icons/fa";
import { BsGift } from "react-icons/bs";

const ConfigsPaymentTab = ({ configs, submit }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    payment: {
      truemoney_gift: configs?.payment?.truemoney_gift || false,
      truemoney_qr: configs?.payment?.truemoney_qr || false,
      promptpay: configs?.payment?.promptpay || false,
      promptpay_id: configs?.payment?.promptpay_id || "",
    },
  });

  useEffect(() => {
    if (configs?.payment) {
      setFormData({
        payment: {
          truemoney_gift: configs.payment.truemoney_gift || false,
          truemoney_qr: configs.payment.truemoney_qr || false,
          promptpay_qr : configs.payment.promptpay || false,
          promptpay_id: configs.payment.promptpay_id || "",
        },
      });
    }
  }, [configs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      payment: {
        ...formData.payment,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      submit(formData);
    } catch (error) {
      toast.add({
        title: "ผิดพลาด!",
        text: error.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <HiOutlineCreditCard className="text-primary" />
        ตั้งค่าระบบเติมเงิน
      </h2>

      <form onSubmit={handleSubmit}>
        {/* TrueMoney Gift */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BsGift className="text-primary" />
              <h3 className="font-semibold">TrueMoney Wallet Gift</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="truemoney_gift"
                checked={formData.payment.truemoney_gift}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600">
            เปิดใช้งานการเติมเงินด้วย TrueMoney Wallet Gift
          </p>
        </div>

        {/* TrueMoney QR */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaQrcode className="text-primary" />
              <h3 className="font-semibold">TrueMoney Wallet QR</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="truemoney_qr"
                checked={formData.payment.truemoney_qr}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600">
            เปิดใช้งานการเติมเงินด้วย TrueMoney Wallet QR
          </p>
        </div>

        {/* PromptPay Section */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaMobileAlt className="text-primary" />
              <h3 className="font-semibold">PromptPay</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="promptpay"
                checked={formData.payment.promptpay}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {formData.payment.promptpay && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                PromptPay E-Wallet ID
              </label>
              <input
                type="text"
                name="promptpay_id"
                value={formData.payment.promptpay_id}
                onChange={handleChange}
                placeholder="เช่น 0812345678"
                className="w-full p-2 border rounded-md"
                maxLength="15"
              />
              <p className="text-xs text-gray-500 mt-1">
                กรุณากรอกหมายเลขโทรศัพท์หรือเลขบัตรประชาชนที่ผูกกับ PromptPay
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigsPaymentTab;
