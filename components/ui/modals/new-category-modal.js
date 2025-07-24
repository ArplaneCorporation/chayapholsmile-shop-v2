import { useContext, useState } from "react";
import CategoryContext from "../../../contexts/category/category-context";
import Select from "../select/select";
import ModalLayout from "./modal-layout/modal-layout";

const NewCategoryModal = ({ setIsOpen }) => {
  const typeOptions = [
    { label: "Stock", value: "STOCK" },
    { label: "ID-PASS", value: "ID_PASS" },
  ];

  const [name, setName] = useState("");
  const [type, setType] = useState(typeOptions[0].value);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { createCategory } = useContext(CategoryContext);

  const handleCreate = async () => {
    setLoading(true);
    try {
      let imageUrl =
        "https://raw.githubusercontent.com/ArplaneCorporation/chayapholsmile-shop-v2/3d59b1175ddb9566e282e2f6514116e770161e66/pictures/categorynopic.png";

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const res = await fetch("https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          imageUrl = data.data.url;
        }
      }

      await createCategory({ name, type, image: imageUrl });
      setIsOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalLayout title="เพิ่มหมวดหมู่ใหม่" setIsOpen={setIsOpen}>
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">ชื่อหมวดหมู่</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
            placeholder="เช่น บัตรเติมเกม"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">ประเภท</label>
          <Select
            value={type}
            onChange={(value) => setType(value)}
            options={typeOptions}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium">ภาพหมวดหมู่ (ถ้ามี)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </ModalLayout>
  );
};

export default NewCategoryModal;
