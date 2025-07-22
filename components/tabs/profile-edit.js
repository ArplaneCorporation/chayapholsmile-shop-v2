import axios from "axios";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/toast/toast-context";
import refreshSession from "../../utils/refresh-session";

const ProfileEditTab = ({ user }) => {
    const [username, setUsername] = useState(user?.username);
    const [email, setEmail] = useState(user?.email);
    const [avatar, setAvatar] = useState(user?.avatar);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isUpdated, setIsUpdated] = useState(false);
    const [error, setError] = useState(null);

    const toast = useToast();

    useEffect(() => {
        if (error) {
            toast.add({
                title: "ผิดพลาด!",
                text: error,
                icon: "error",
            });
            setError(null);
        }

        if (isUpdated) {
            toast.add({
                title: "สำเร็จ!",
                text: "แก้ไขข้อมูลแล้ว",
                icon: "success",
            });

            setIsUpdated(false);
        }
    }, [error, isUpdated, toast]);

    // สร้าง preview เมื่อเลือกไฟล์ใหม่
    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // ทำความสะอาดเมื่อ component unmount หรือไฟล์เปลี่ยน
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null);
            return;
        }

        const file = e.target.files[0];
        
        // ตรวจสอบประเภทไฟล์
        if (!file.type.match('image.*')) {
            setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
            return;
        }
        
        // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("ขนาดไฟล์ไม่ควรเกิน 5MB");
            return;
        }

        setSelectedFile(file);
    };

    const uploadImage = async () => {
        if (!selectedFile) return null;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const { data } = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return data.url;
        } catch (error) {
            setError(error.response?.data?.message || "อัปโหลดรูปภาพไม่สำเร็จ");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let newAvatar = avatar;
            
            // ถ้ามีการเลือกไฟล์ใหม่ ให้อัปโหลดไฟล์
            if (selectedFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    newAvatar = uploadedUrl;
                    setAvatar(uploadedUrl);
                } else {
                    return; // หยุดการทำงานหากอัปโหลดไม่สำเร็จ
                }
            }

            const config = { headers: { "Content-Type": "application/json" } };

            const { data } = await axios.patch(
                `/api/auth/@me`,
                {
                    username,
                    email,
                    avatar: newAvatar,
                    confirmPassword,
                },
                config
            );

            setIsUpdated(data.success);
            await refreshSession();
            setConfirmPassword("");
            setSelectedFile(null);
        } catch (error) {
            setError(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
            console.error(error.message);
        }
    };

    return (
        <div id="general-config" className="grid grid-cols-2 gap-6 p-6">
            <div className="col-span-2">
                <h3 className="text-lg font-medium leading-6">แก้ไขโปรไฟล์</h3>
                <p className="mt-1 text-sm text-gray-600">
                    แก้ไขรายละเอียดข้อมูลของคุณ
                </p>
            </div>

            <hr className="col-span-2" />

            <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium tracking-wide">
                    ชื่อผู้ใช้
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                />
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium tracking-wide">
                    อีเมล
                </label>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                />
            </div>
            <div className="col-span-2">
                <label className="block text-sm font-medium tracking-wide">
                    รูปภาพโปรไฟล์
                </label>
                
                <div className="mt-2 flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <img 
                            className="h-16 w-16 rounded-full object-cover"
                            src={preview || avatar || "/default-avatar.png"} 
                            alt="Preview"
                        />
                    </div>
                    
                    <div className="flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            disabled={isUploading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF ขนาดไม่เกิน 5MB
                        </p>
                    </div>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium tracking-wide">
                    ยืนยันรหัสผ่าน
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    placeholder="จำเป็นสำหรับการเปลี่ยนแปลงข้อมูล"
                />
            </div>

            <hr className="col-span-2" />

            <div className="col-span-2 flex items-center justify-end gap-x-4">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className={`inline-flex items-center bg-primary rounded-md transition-all overflow-hidden ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <div className="w-full h-full inline-flex items-center justify-center font-medium text-white hover:backdrop-brightness-95 py-2 px-4">
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="block">กำลังอัปโหลด...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 mr-2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="block">บันทึก</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ProfileEditTab;
