import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { generateQRCode } from '../../utils/qr-generator';

const PromptPayQRTab = () => {
    const { data: session } = useSession();
    const [amount, setAmount] = useState(100);
    const [qrCode, setQrCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    // ข้อมูล PromptPay ที่จะให้ผู้ใช้โอน
    const promptPayId = '0812345678'; // เปลี่ยนเป็นเบอร์หรือเลข PromptPay ของคุณ
    const promptPayName = 'Your Shop Name';

    useEffect(() => {
        generateNewQR();
    }, [amount]);

    const generateNewQR = async () => {
        setIsLoading(true);
        try {
            // สร้าง transaction ID ใหม่
            const newTransactionId = `PP${Date.now()}`;
            setTransactionId(newTransactionId);
            
            // สร้าง QR Code
            const qrData = generatePromptPayData(promptPayId, amount, newTransactionId);
            const qrImage = await generateQRCode(qrData);
            setQrCode(qrImage);
        } catch (error) {
            console.error('Error generating QR:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generatePromptPayData = (id, amount, reference) => {
        // สร้างข้อมูลสำหรับ PromptPay QR ตามมาตรฐานของไทย
        return `00020101021129370016A0000006770101110213${id}5802TH5303764540${amount.toFixed(2)}30${reference.length.toString().padStart(2, '0')}${reference}6304`;
    };

    const handleAmountChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 20 && value <= 50000) {
            setAmount(value);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">เติมเงินด้วย PromptPay QR</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2" htmlFor="amount">
                    จำนวนเงิน (THB)
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        id="amount"
                        min="20"
                        max="50000"
                        value={amount}
                        onChange={handleAmountChange}
                        className="w-full p-2 border rounded-md"
                    />
                    <button
                        onClick={generateNewQR}
                        disabled={isLoading}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
                    >
                        {isLoading ? 'กำลังสร้าง...' : 'สร้าง QR ใหม่'}
                    </button>
                </div>
            </div>

            {qrCode && (
                <div className="flex flex-col items-center mb-6">
                    <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
                        <Image
                            src={qrCode}
                            alt="PromptPay QR Code"
                            width={300}
                            height={300}
                            className="mx-auto"
                        />
                    </div>
                    <p className="text-center mb-2">
                        <span className="font-semibold">จำนวนเงิน:</span> {amount.toLocaleString()} บาท
                    </p>
                    <p className="text-center mb-4">
                        <span className="font-semibold">เลขที่อ้างอิง:</span> {transactionId}
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full">
                        <p className="text-yellow-700">
                            <strong>คำแนะนำ:</strong> หลังจากโอนเงินแล้ว กรุณารอระบบตรวจสอบอัตโนมัติภายใน 5-10 นาที
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-2">ขั้นตอนการเติมเงิน</h3>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>เลือกจำนวนเงินที่ต้องการเติม</li>
                    <li>สแกน QR Code ด้วยแอปธนาคารหรือแอปพร้อมเพย์</li>
                    <li>ตรวจสอบจำนวนเงินและเลขที่อ้างอิงให้ถูกต้อง</li>
                    <li>ทำการชำระเงิน</li>
                    <li>รอระบบตรวจสอบการเติมเงินอัตโนมัติ</li>
                </ol>
            </div>
        </div>
    );
};

export default PromptPayQRTab;
