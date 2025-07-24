import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import CategoryContext from "../../../contexts/category/category-context";
import ProductContext from "../../../contexts/product/product-context";
import ModalLayout from "./modal-layout/modal-layout";

const NewProductModal = ({ setIsOpen }) => {
    const router = useRouter();
    const cid = router.query.cid;

    const { createProduct } = useContext(ProductContext);
    const { getAdminDetailsCategory, category } = useContext(CategoryContext);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getAdminDetailsCategory(cid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cid]);

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);
            const res = await fetch("https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImage(data.data.url);
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
            console.error("Image upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        createProduct({
            name,
            description,
            price,
            category: category._id,
            type: category.type,
            image,
            isFeatured,
        });

        setIsOpen(false);
    };

    return (
        <ModalLayout>
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">เพิ่มสินค้าใหม่</h2>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center font-medium text-black py-2 rounded-md transition-all hover:scale-125"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form autoComplete="off" onSubmit={handleSubmit} className="px-6 py-6 w-[95vw] md:w-[40rem] grid grid-cols-6 gap-6">
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">ชื่อสินค้า</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">ราคา</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    />
                </div>

                <div className="col-span-6">
                    <label className="block text-sm font-medium tracking-wide">รายละเอียด</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-2 block w-full rounded-md border focus:outline-none border-gray-300 focus:border-blue-600 shadow-sm md:text-base"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">หมวดหมู่</label>
                    <input
                        type="text"
                        value={category?.name || ""}
                        readOnly
                        className="mt-1 p-2 block w-full bg-gray-100 rounded-md border border-gray-300 shadow-sm md:text-base"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium tracking-wide">อัปโหลดรูปภาพ</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                        className="mt-1 block w-full text-sm"
                    />
                    {uploading && <p className="text-xs text-gray-500 mt-1">กำลังอัปโหลด...</p>}
                    {image && (
                        <img src={image} alt="preview" className="mt-2 w-full h-[140px] object-cover rounded border" />
                    )}
                </div>

                {category?.type === "STOCK" && (
                    <div className="col-span-6">
                        <label className="inline-flex relative items-center">
                            <input type="checkbox" className="sr-only peer" checked={isFeatured} readOnly />
                            <div
                                onClick={() => setIsFeatured(!isFeatured)}
                                className="w-11 h-6 cursor-pointer bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
                            ></div>
                            <span className="ml-4 text-base font-medium text-gray-900">แสดงสินค้าในหน้าหลัก</span>
                        </label>
                    </div>
                )}
            </form>

            <div className="w-full px-6 py-4 flex items-center justify-end gap-x-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center font-medium border hover:bg-gray-100/80 py-2 px-4 rounded-md transition-all"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="inline-flex items-center bg-primary rounded-md transition-all overflow-hidden text-white py-2 px-4 hover:brightness-95"
                >
                    เพิ่ม
                </button>
            </div>
        </ModalLayout>
    );
};

export default NewProductModal;
