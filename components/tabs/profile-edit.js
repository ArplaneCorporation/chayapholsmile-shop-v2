"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.put("/api/profile", { name, image });
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center text-primary mb-8">
        แก้ไขโปรไฟล์
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={image || "/default-avatar.png"}
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full object-cover border border-gray-300"
          />
          <input
            type="text"
            placeholder="URL รูปภาพ"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">ชื่อ</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
        >
          บันทึก
        </button>
      </form>
    </div>
  );
}
