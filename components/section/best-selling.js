const BestSelling = ({ products }) => {
    // ถ้าไม่ใช่ array ให้ return แสดงข้อความแทน
    if (!Array.isArray(products)) {
        return <p className="text-red-500 px-4">ไม่มีข้อมูลสินค้าขายดี</p>;
    }

    // เรียงสินค้าขายดีจากมากไปน้อย
    const sortedProducts = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));

    return (
        <div className="flex flex-col overflow-x-auto">
            <ul>
                {sortedProducts.map((product, index) => (
                    <li
                        key={index}
                        className={`flex flex-row items-center justify-between py-3 px-3 ${
                            index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                        }`}
                    >
                        <div className="flex flex-row gap-x-4 items-center">
                            <div className="rounded-full bg-red-300 w-7 h-7 flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <h1>{product.name}</h1>
                        </div>
                        <p>{product.sold ?? 0} ชิ้น</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BestSelling;
