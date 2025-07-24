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

  // สร้าง preview รูปเมื่อเลือกไฟล์
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // ฟังก์ชันอัปโหลดไฟล์ไป ImgBB
  const uploadImageToImgBB = async () => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error?.message || "อัปโหลดรูปภาพไม่สำเร็จ");
      }

      return response.data.data.image.url;
    } catch (error) {
      setError(error.response?.data?.error?.message || error.message || "อัปโหลดรูปภาพไม่สำเร็จ");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let newAvatar = avatar;

      // ถ้ามีไฟล์ใหม่ อัปโหลดก่อน
      if (selectedFile) {
        const uploadedUrl = await uploadImageToImgBB();
        if (uploadedUrl) {
          newAvatar = uploadedUrl;
          setAvatar(uploadedUrl);
          setSelectedFile(null);
          setPreview(null);
        } else {
          return; // อัปโหลดไม่สำเร็จ หยุดเลย
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
    } catch (error) {
      setError(error.response?.data?.message || error.message || "เกิดข้อผิดพลาด");
      console.error(error.message);
    }
  };

  return (
    <div id="general-config" className="grid grid-cols-2 gap-6 p-6">
      <div className="col-span-2">
        <h3 className="text-lg font-medium leading-6">แก้ไขโปรไฟล์</h3>
        <p className="mt-1 text-sm text-gray-600">แก้ไขรายละเอียดข้อมูลของคุณ</p>
      </div>

      <hr className="col-span-2" />

      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">ชื่อผู้ใช้</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">อีเมล</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">รูปภาพ (URL หรือ เลือกไฟล์)</label>

        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          disabled={isUploading}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base mb-2"
          placeholder="วาง URL รูปภาพ หรือเลือกไฟล์ด้านล่าง"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0]);
            }
          }}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 rounded-md max-w-[200px] max-h-[200px] object-cover border border-gray-300"
          />
        )}

        {isUploading && (
          <p className="mt-1 text-xs text-blue-600">กำลังอัปโหลดรูปภาพ...</p>
        )}
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="block text-sm font-medium tracking-wide">ยืนยันรหัสผ่าน</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
        />
      </div>

      <hr className="col-span-2" />

      <div className="col-span-2 flex items-center justify-end gap-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUploading}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="block">{isUploading ? "กำลังบันทึก..." : "บันทึก"}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfileEditTab;
