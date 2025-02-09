import React, { useContext, useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);

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

    return (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <h3>{product.name}</h3>
                    <p>Price: {product.price} VND</p>
                    <button onClick={() => alert("Chi tiết sản phẩm: " + product.name)}>
                        Chi tiết
                    </button>
                    <button onClick={() => addToCart(product)}>Thêm vào giỏ hàng</button>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
