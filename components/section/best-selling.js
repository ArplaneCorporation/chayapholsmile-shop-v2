const BestSelling = ({ products }) => {
    return (
        <div className="flex flex-col overflow-x-auto">
            <ul>
                {products?.map((product, index) => (
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
                        <p>{product.sold} ชิ้น</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BestSelling;
