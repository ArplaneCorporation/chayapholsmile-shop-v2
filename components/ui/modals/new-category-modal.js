import { useContext, useState } from "react";
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
  const [type, setType] = useState("STOCK");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    let imageUrl =
      "https://raw.githubusercontent.com/ArplaneCorporation/chayapholsmile-shop-v2/3d59b1175ddb9566e282e2f6514116e770161e66/pictures/categorynopic.png";

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.success) {
        imageUrl = data.data.url;
      }
    }

    await createCategory({ name, type, image: imageUrl });
    setIsOpen(false);
  };

  return (
    <ModalLayout title="New Category" setIsOpen={setIsOpen}>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="ชื่อหมวดหมู่"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <Select
          label="ประเภท"
          options={typeOptions}
          value={type}
          onChange={(value) => setType(value)}
        />

        <div>
          <label>อัปโหลดรูปภาพ</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="mt-2">
          <label>ตัวอย่างภาพ:</label>
          <img
            src={previewUrl || "https://raw.githubusercontent.com/ArplaneCorporation/chayapholsmile-shop-v2/3d59b1175ddb9566e282e2f6514116e770161e66/pictures/categorynopic.png"}
            alt="Preview"
            className="w-32 h-32 object-cover mt-2 rounded border"
          />
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          สร้างหมวดหมู่
        </button>
      </div>
    </ModalLayout>
  );
};

export default NewCategoryModal;
