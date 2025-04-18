//src/components/products/ProductList.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm import
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate(); // Khởi tạo useNavigate

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

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`${product.name} đã được thêm vào giỏ hàng!`);
    };

    return (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <h3>{product.name}</h3>
                    <p>Price: {product.price} VND</p>
                    <button onClick={() => navigate(`/product/${product.id}`)}>
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