import { useContext, useEffect, useState } from "react";
import CategoryContext from "../../../contexts/category/category-context";
import Select from "../select/select";
import ModalLayout from "./modal-layout/modal-layout";

const NewCategoryModal = ({ setIsOpen }) => {
    const typeOptions = [
        { label: "Stock", value: "STOCK" },
        { label: "ID-PASS", value: "ID_PASS" },
    ];

    const { createCategory } = useContext(CategoryContext);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState({});
    const [isUid, setIsUid] = useState(false);
    const [image, setImage] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            // แทนที่ da7790754b7c91f3f7ffe7b5ee7c5146 ด้วย API key ของคุณเองถ้าจำเป็น
            const response = await fetch(
                "https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (result.success) {
                setImage(result.data.url);
            } else {
                alert("อัปโหลดรูปไม่สำเร็จ");
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        createCategory({
            name: name,
            description: description,
            type: type.value,
            form_uid: isUid,
            image: image,
        });
        setIsOpen(false);
    };

    return (
        <ModalLayout>
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">สร้างหมวดหมู่ใหม่</h2>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center font-medium text-black py-2 rounded-md transition-all hover:scale-125"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <form
                autoComplete="off"
                className="px-6 py-4 w-[95vw] md:w-[25rem] grid grid-cols-3 gap-6"
            >
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">
                        ชื่อหมวดหมู่
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    />
                </div>
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">
                        รายละเอียด
                    </label>
                    <input
                        type="text"
                        name="description"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    />
                </div>
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm mb-1 font-medium tracking-wide">
                        ประเภท
                    </label>
                    <Select
                        placeholder="เลือกหมวดหมู่"
                        options={typeOptions}
                        selected={type}
                        setSelected={setType}
                    />
                </div>
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">
                        รูปภาพ (348x200)
                    </label>
                    <input
                        type="text"
                        name="image"
                        id="image"
                        value={image}
                        readOnly
                        className="mt-1 p-2 block w-full rounded-md border bg-gray-50 cursor-not-allowed"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-2"
                        disabled={uploading}
                    />
                    {uploading && <p>กำลังอัปโหลด...</p>}
                </div>
                {type.value === "ID_PASS" && (
                    <div className="col-span-6 md:col-span-3 flex items-center">
                        <label className="inline-flex relative items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isUid}
                                onChange={() => setIsUid(!isUid)}
                            />
                            <div
                                className="w-11 h-6 bg-gray-300 rounded-full peer-focus:ring-green-300 peer-checked:bg-green-600 relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
                            ></div>
                            <span className="ml-4 text-base font-medium text-gray-900">
                                ฟอร์มประเภท UID
                            </span>
                        </label>
                    </div>
                )}
            </form>
            <div className="w-full px-6 py-4 flex items-center justify-end gap-x-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center font-medium border hover:bg-gray-100/80 py-2 px-2 md:px-4 rounded-md transition-all"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="block">ยกเลิก</span>
                </button>
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
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="block">สร้าง</span>
                    </div>
                </button>
            </div>
        </ModalLayout>
    );
};

export default NewCategoryModal;
