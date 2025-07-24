import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import CategoryContext from "../../../contexts/category/category-context";
import ProductContext from "../../../contexts/product/product-context";
import ModalLayout from "./modal-layout/modal-layout";

const apiKey = "da7790754b7c91f3f7ffe7b5ee7c5146";

const uploadImageToImgbb = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    return data?.data?.url;
};

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
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getAdminDetailsCategory(cid);
    }, [cid]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let imageUrl = image;
        if (imageFile) {
            imageUrl = await uploadImageToImgbb(imageFile);
        }

        createProduct({
            name,
            description,
            price,
            category: category._id,
            type: category.type,
            image: imageUrl,
            isFeatured,
        });

        setUploading(false);
        setIsOpen(false);
    };

    return (
        <ModalLayout>
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">เพิ่มสินค้าใหม่</h2>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:scale-125 transition-all"
                >
                    ✕
                </button>
            </div>

            <form
                autoComplete="off"
                className="px-6 py-6 w-[95vw] md:w-[40rem] grid grid-cols-6 gap-6"
            >
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium">ชื่อสินค้า</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-2 block w-full border rounded-md"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium">ราคา</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 p-2 block w-full border rounded-md"
                    />
                </div>

                <div className="col-span-6">
                    <label className="block text-sm font-medium">รายละเอียด</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-2 block w-full border rounded-md"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium">หมวดหมู่</label>
                    <input
                        type="text"
                        value={category?.name || ""}
                        disabled
                        className="mt-1 p-2 block w-full border rounded-md bg-gray-100"
                    />
                </div>

                <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm font-medium">รูปภาพ</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1 block w-full"
                    />
                </div>

                {category?.type === "STOCK" && (
                    <div className="col-span-6">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={() => setIsFeatured(!isFeatured)}
                                className="mr-2"
                            />
                            แสดงสินค้าในหน้าหลัก
                        </label>
                    </div>
                )}
            </form>

            <div className="w-full px-6 py-4 flex justify-end gap-x-4">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="border px-4 py-2 rounded-md hover:bg-gray-100"
                >
                    ยกเลิก
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={uploading}
                >
                    {uploading ? "กำลังอัปโหลด..." : "เพิ่ม"}
                </button>
            </div>
        </ModalLayout>
    );
};

export default NewProductModal;
