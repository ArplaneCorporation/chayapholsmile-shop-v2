import { useState } from "react";

const ConfigsPaymentTab = ({ configs, submit }) => {
  const [isTmGift, setIsTmGift] = useState(configs?.payment?.truemoney_gift);
  const [isTmQr, setIsTmQr] = useState(configs?.payment?.truemoney_qr);
  const [isTrueMoney, setIsTrueMoney] = useState(configs?.payment?.truemoney);
  const [isPpQr, setIsPpQr] = useState(configs?.payment?.promptpay_qr || false);

  const [twPhone, setTwPhone] = useState(configs?.payment?.truemoney_phone || "");
  const [promptpayId, setPromptpayId] = useState(configs?.payment?.promptpay_id || "");
  const [bankAccountNameTh, setBankAccountNameTh] = useState(configs?.payment?.bank_account_name_th || "");
  const [bankAccountNameEn, setBankAccountNameEn] = useState(configs?.paymentimport { useState } from "react";

const ConfigsPaymentTab = ({ configs, submit }) => {
  // สถานะและข้อมูลของแต่ละช่องทางเติมเงิน
  const [isTmGift, setIsTmGift] = useState(configs?.payment?.truemoney_gift);
  const [isTmQr, setIsTmQr] = useState(configs?.payment?.truemoney_qr);
  const [isTrueMoney, setIsTrueMoney] = useState(configs?.payment?.truemoney);
  const [isPpQr, setIsPpQr] = useState(configs?.payment?.promptpay_qr || false);

  const [twPhone, setTwPhone] = useState(configs?.payment?.truemoney_phone || "");
  const [promptpayId, setPromptpayId] = useState(configs?.payment?.promptpay_id || "");
  const [bankAccountNameTh, setBankAccountNameTh] = useState(configs?.payment?.bank_account_name_th || "");
  const [bankAccountNameEn, setBankAccountNameEn] = useState(configs?.payment?.bank_account_name_en || "");

  // เพิ่มค่าธรรมเนียมของแต่ละช่องทาง — ตัวอย่าง PromptPay
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

        // ส่งค่าธรรมเนียมเพิ่ม
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
?.bank_account_name_en || "");

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
      },
    });
  };

  return (
    <div id="payment-config" className="grid grid-cols-2 gap-6 p-6">
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">ตั้งค่าระบบเติมเงิน</h3>
        <p className="mt-1 text-sm text-gray-600">
          แก้ไขรายละเอียดการเติมเงิน และเลือกใช้วิธีชำระเงินที่ต้องการ
        </p>
      </div>

      <hr className="col-span-2" />

      {/* TrueMoney Wallet Gift */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">TrueMoney Wallet Gift</h3>
        <p className="mt-1 text-sm text-gray-600">เติมเงินด้วยระบบ TrueMoney Wallet Gift</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-x-4">
        <div className="col-span-2">
          <h2 className="text-base font-medium leading-6">สถานะ</h2>
          <p className="mt-1 text-sm text-gray-600">กำหนดสถานะของระบบ TrueMoney Wallet Gift</p>
        </div>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isTmGift}
            readOnly
          />
          <div
            onClick={() => setIsTmGift(!isTmGift)}
            className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-green-300 peer-checked:bg-green-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
          />
        </label>
      </div>

      {/* เบอร์โทรศัพท์ TrueMoney */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">เบอร์โทรศัพท์</label>
        <input
          type="tel"
          name="twPhone"
          id="twPhone"
          value={twPhone}
          onChange={(e) => setTwPhone(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
        />
      </div>

      {/* ค่าธรรมเนียม (ตัวอย่างเก็บในเบอร์โทร แต่ควรเปลี่ยนชื่อ) */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">ค่าธรรมเนียม</label>
        <input
          type="tel"
          name="fee"
          id="fee"
          value={twPhone}  // คุณอาจจะแยกสถานะใหม่ถ้าต้องการเก็บค่าธรรมเนียมจริงๆ
          onChange={(e) => setTwPhone(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
        />
      </div>

      <hr className="col-span-2" />

      {/* PromptPay QR */}
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">PromptPay QR</h3>
        <p className="mt-1 text-sm text-gray-600">เปิด/ปิดการใช้งาน PromptPay QR</p>
      </div>
      <div className="col-span-2 flex items-center justify-between gap-x-4">
        <div className="col-span-2">
          <h2 className="text-base font-medium leading-6">สถานะ</h2>
          <p className="mt-1 text-sm text-gray-600">กำหนดสถานะของระบบ PromptPay QR</p>
        </div>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isPpQr}
            readOnly
          />
          <div
            onClick={() => setIsPpQr(!isPpQr)}
            className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-green-300 peer-checked:bg-green-600 cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
          />
        </label>
      </div>

      {/* PromptPay E-Wallet ID */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">PromptPay E-Wallet ID</label>
        <input
          type="text"
          name="promptpayId"
          id="promptpayId"
          value={promptpayId}
          onChange={(e) => setPromptpayId(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
          placeholder="กรอกหมายเลข PromptPay เช่น เบอร์มือถือ หรือเลขบัตรประชาชน"
        />
      </div>

      {/* ชื่อบัญชีผู้รับเงิน (ไทย) */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">ชื่อบัญชีผู้รับเงิน (ภาษาไทย)</label>
        <input
          type="text"
          name="bankAccountNameTh"
          id="bankAccountNameTh"
          value={bankAccountNameTh}
          onChange={(e) => setBankAccountNameTh(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
          placeholder="กรอกชื่อบัญชีภาษาไทย"
        />
      </div>

      {/* ชื่อบัญชีผู้รับเงิน (อังกฤษ) */}
      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">ชื่อบัญชีผู้รับเงิน (ภาษาอังกฤษ)</label>
        <input
          type="text"
          name="bankAccountNameEn"
          id="bankAccountNameEn"
          value={bankAccountNameEn}
          onChange={(e) => setBankAccountNameEn(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
          placeholder="กรอกชื่อบัญชีภาษาอังกฤษ"
        />
      </div>

      <hr className="col-span-2" />

      <div className="col-span-2 flex items-center justify-end gap-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center bg-primary rounded-md transition-all overflow-hidden"
        >
          <div className="w-full h-full inline-flex items-center justify-center font-medium text-white hover:backdrop-brightness-95 py-2 px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block">บันทึก</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ConfigsPaymentTab;
