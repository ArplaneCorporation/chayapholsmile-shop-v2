import { useState } from "react";
import ModalLayout from "./modal-layout/modal-layout";
import { useProduct } from "../../../contexts/product/product-context";

const UpdateProductModal = ({ setIsOpen, product }) => {
    const { updateProduct } = useProduct();

    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [image, setImage] = useState(product.image);
    const [price, setPrice] = useState(product.price);
    const [isFeatured, setIsFeatured] = useState(product.isFeatured);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        updateProduct(product._id, {
            name,
            description,
            image,
            price,
            isFeatured,
        });

        setIsOpen(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImage(data.data.url);
        } catch (err) {
            console.error("Error uploading image:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ModalLayout setIsOpen={setIsOpen}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name">ชื่อสินค้า</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label htmlFor="description">คำอธิบาย</label>
                    <textarea
                        name="description"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label htmlFor="image">รูปสินค้า</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block mb-2"
                    />
                    {isUploading ? (
                        <p>กำลังอัปโหลด...</p>
                    ) : (
                        image && (
                            <img src={image} alt="Preview" className="w-24 h-24 object-cover rounded" />
                        )
                    )}
                </div>

                <div>
                    <label htmlFor="price">ราคา</label>
                    <input
                        type="number"
                        name="price"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="mr-2"
                        />
                        สินค้าแนะนำ
                    </label>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={isUploading}
                >
                    บันทึกการแก้ไข
                </button>
            </form>
        </ModalLayout>
    );
};

export default UpdateProductModal;
