import { useContext, useEffect, useState } from "react";
import ModalLayout from "./modal-layout/modal-layout";
import ProductContext from "../../../contexts/product/product-context";
import Button from "../buttons/button";
import TextInput from "../inputs/text-input";
import Select from "../select/select";

const EditProductModal = ({ setIsOpen, product }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category?._id);
  const [image, setImage] = useState(product.image);
  const [type, setType] = useState(product.type);

  const { updateProduct } = useContext(ProductContext);

  const handleUpdate = async () => {
    await updateProduct({
      ...product,
      name,
      description,
      price,
      category,
      image,
      type,
    });

    setIsOpen(false);
  };

  return (
    <ModalLayout title="แก้ไขสินค้า" setIsOpen={setIsOpen}>
      <div className="flex flex-col gap-y-4">
        <TextInput label="ชื่อสินค้า" value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput label="คำอธิบาย" value={description} onChange={(e) => setDescription(e.target.value)} />
        <TextInput label="ราคา" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <TextInput label="ลิงก์รูปภาพ" value={image} onChange={(e) => setImage(e.target.value)} />
        <TextInput label="ประเภท (เช่น physical/digital)" value={type} onChange={(e) => setType(e.target.value)} />
        <Select
          label="หมวดหมู่"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Button onClick={handleUpdate}>อัปเดตสินค้า</Button>
      </div>
    </ModalLayout>
  );
};

export default EditProductModal;
