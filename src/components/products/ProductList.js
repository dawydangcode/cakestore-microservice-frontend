import React, { useContext, useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);

    // Lấy danh sách sản phẩm từ backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosClient.get("/products/list");
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    // Xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToCart = (product) => {
        addToCart(product); // Gọi hàm từ CartContext
        alert(`${product.name} đã được thêm vào giỏ hàng!`);
    };

    return (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <h3>{product.name}</h3>
                    <p>Price: {product.price} VND</p>
                    <button onClick={() => alert("Chi tiết sản phẩm: " + product.name)}>
                        Chi tiết
                    </button>
                    <button onClick={() => handleAddToCart(product)}>
                        Thêm vào giỏ hàng
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ProductList;