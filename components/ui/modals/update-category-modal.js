import { useContext, useState } from "react";
import CategoryContext from "../../../contexts/category/category-context";
import ModalLayout from "./modal-layout/modal-layout";

const UpdateCategoryModal = ({ category, setIsOpen }) => {
  const { updateCategory } = useContext(CategoryContext);

  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [image, setImage] = useState(category.image);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=da7790754b7c91f3f7ffe7b5ee7c5146",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.success) {
          imageUrl = data.data.url;
        }
      }

      await updateCategory(category._id, {
        name,
        description,
        image: imageUrl,
      });

      setIsOpen(false);
    } catch (err) {
      console.error("Error updating category:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalLayout>
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">แก้ไขหมวดหมู่</h2>
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
        onSubmit={handleSubmit}
        className="px-6 py-4 w-[95vw] md:w-[25rem] grid grid-cols-3 gap-6"
      >
        <div className="col-span-6 md:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium tracking-wide">
            ชื่อหมวดหมู่
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 shadow-sm md:text-base"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label htmlFor="description" className="block text-sm font-medium tracking-wide">
            รายละเอียด
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 shadow-sm md:text-base"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label htmlFor="image" className="block text-sm font-medium tracking-wide">
            ลิงก์รูปภาพ (ถ้ามี)
          </label>
          <input
            type="text"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 p-2 block w-full rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 shadow-sm md:text-base"
            placeholder="หรือลิงก์จากภายนอก"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label className="block text-sm font-medium tracking-wide">
            หรืออัปโหลดภาพใหม่
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-700"
          />
        </div>
      </form>

      <div className="w-full px-6 py-4 flex items-center justify-end gap-x-4">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex items-center font-medium border hover:bg-gray-100/80 py-2 px-4 rounded-md transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ยกเลิก
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center bg-primary text-white font-medium rounded-md transition-all py-2 px-4 hover:opacity-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </ModalLayout>
  );
};

export default UpdateCategoryModal;
