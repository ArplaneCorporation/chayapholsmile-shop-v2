import { useState } from "react";

const ConfigsPaymentTab = ({ configs, submit }) => {
  const [isTmGift, setIsTmGift] = useState(configs?.payment?.truemoney_gift || false);
  const [isTmQr, setIsTmQr] = useState(configs?.payment?.truemoney_qr || false);
  const [isTrueMoney, setIsTrueMoney] = useState(configs?.payment?.truemoney || false);
  const [isPpQr, setIsPpQr] = useState(configs?.payment?.promptpay_qr || false);

  const [twPhone, setTwPhone] = useState(configs?.payment?.truemoney_phone || "");
  const [promptpayId, setPromptpayId] = useState(configs?.payment?.promptpay_id || "");
  const [bankAccountNameTh, setBankAccountNameTh] = useState(configs?.payment?.bank_account_name_th || "");
  const [bankAccountNameEn, setBankAccountNameEn] = useState(configs?.payment?.bank_account_name_en || "");

  // ค่าธรรมเนียม (ตัวอย่าง)
  const [tmGiftFeeValue, setTmGiftFeeValue] = useState(configs?.payment?.truemoney_gift_fee_value || "");
  const [tmGiftFeeType, setTmGiftFeeType] = useState(configs?.payment?.truemoney_gift_fee_type || "amount");

  const [tmQrFeeValue, setTmQrFeeValue] = useState(configs?.payment?.truemoney_qr_fee_value || "");
  const [tmQrFeeType, setTmQrFeeType] = useState(configs?.payment?.truemoney_qr_fee_type || "amount");

  const [ppFeeValue, setPpFeeValue] = useState(configs?.payment?.promptpay_qr_fee_value || "");
  const [ppFeeType, setPpFeeType] = useState(configs?.payment?.promptpay_qr_fee_type || "amount");

  const handleSubmit = (e) => {
    e.preventDefault();

    submit({
      payment: {
        truemoney_gift: isTmGift,
        truemoney_qr: isTmQr,
        truemoney: isTrueMoney,
        promptpay_qr: isPpQr,
        promptpay_id: promptpayId,
        truemoney_phone: twPhone,
        bank_account_name_th: bankAccountNameTh,
        bank_account_name_en: bankAccountNameEn,

        truemoney_gift_fee_value: tmGiftFeeValue,
        truemoney_gift_fee_type: tmGiftFeeType,

        truemoney_qr_fee_value: tmQrFeeValue,
        truemoney_qr_fee_type: tmQrFeeType,

        promptpay_qr_fee_value: ppFeeValue,
        promptpay_qr_fee_type: ppFeeType,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-6">
      {/* TrueMoney Wallet Gift */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">TrueMoney Wallet Gift</h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isTmGift}
            onChange={() => setIsTmGift(!isTmGift)}
            className="cursor-pointer"
          />
          <span>เปิดใช้งาน TrueMoney Wallet Gift</span>
        </label>
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">เบอร์โทรศัพท์ TrueMoney</label>
        <input
          type="tel"
          value={twPhone}
          onChange={(e) => setTwPhone(e.target.value)}
          placeholder="เบอร์โทรศัพท์"
          className="mt-1 p-2 block w-full border rounded-md"
        />
      </div>

      {/* ค่าธรรมเนียม TrueMoney Gift */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">ค่าธรรมเนียม TrueMoney Gift</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={tmGiftFeeValue}
            onChange={(e) => setTmGiftFeeValue(e.target.value)}
            placeholder="เช่น 10 หรือ 2.5"
            className="p-2 w-full border rounded-md"
          />
          <select
            value={tmGiftFeeType}
            onChange={(e) => setTmGiftFeeType(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="amount">บาท</option>
            <option value="percent">เปอร์เซ็นต์ (%)</option>
          </select>
        </div>
      </div>

      {/* TrueMoney Wallet QR */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">TrueMoney Wallet QR</h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isTmQr}
            onChange={() => setIsTmQr(!isTmQr)}
            className="cursor-pointer"
          />
          <span>เปิดใช้งาน TrueMoney Wallet QR</span>
        </label>
      </div>

      {/* ค่าธรรมเนียม TrueMoney QR */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">ค่าธรรมเนียม TrueMoney QR</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={tmQrFeeValue}
            onChange={(e) => setTmQrFeeValue(e.target.value)}
            placeholder="เช่น 10 หรือ 2.5"
            className="p-2 w-full border rounded-md"
          />
          <select
            value={tmQrFeeType}
            onChange={(e) => setTmQrFeeType(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="amount">บาท</option>
            <option value="percent">เปอร์เซ็นต์ (%)</option>
          </select>
        </div>
      </div>

      {/* PromptPay QR */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">PromptPay QR</h3>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPpQr}
            onChange={() => setIsPpQr(!isPpQr)}
            className="cursor-pointer"
          />
          <span>เปิดใช้งาน PromptPay QR</span>
        </label>
      </div>

      {/* PromptPay E-Wallet ID */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">PromptPay E-Wallet ID</label>
        <input
          type="text"
          value={promptpayId}
          onChange={(e) => setPromptpayId(e.target.value)}
          placeholder="กรอกเบอร์มือถือหรือเลขบัตรประชาชน"
          className="mt-1 p-2 block w-full border rounded-md"
        />
      </div>

      {/* ค่าธรรมเนียม PromptPay */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">ค่าธรรมเนียม PromptPay</label>
        <div className="flex gap-2 mt-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={ppFeeValue}
            onChange={(e) => setPpFeeValue(e.target.value)}
            placeholder="เช่น 10 หรือ 2.5"
            className="p-2 w-full border rounded-md"
          />
          <select
            value={ppFeeType}
            onChange={(e) => setPpFeeType(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="amount">บาท</option>
            <option value="percent">เปอร์เซ็นต์ (%)</option>
          </select>
        </div>
      </div>

      {/* ชื่อบัญชีผู้รับเงิน (ไทย) */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">ชื่อบัญชีผู้รับเงิน (ภาษาไทย)</label>
        <input
          type="text"
          value={bankAccountNameTh}
          onChange={(e) => setBankAccountNameTh(e.target.value)}
          placeholder="กรอกชื่อบัญชีภาษาไทย"
          className="mt-1 p-2 block w-full border rounded-md"
        />
      </div>

      {/* ชื่อบัญชีผู้รับเงิน (อังกฤษ) */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium">ชื่อบัญชีผู้รับเงิน (ภาษาอังกฤษ)</label>
        <input
          type="text"
          value={bankAccountNameEn}
          onChange={(e) => setBankAccountNameEn(e.target.value)}
          placeholder="กรอกชื่อบัญชีภาษาอังกฤษ"
          className="mt-1 p-2 block w-full border rounded-md"
        />
      </div>

      <div className="col-span-2 text-right">
        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded-md"
        >
          บันทึก
        </button>
      </div>
    </form>
  );
};

export default ConfigsPaymentTab;
