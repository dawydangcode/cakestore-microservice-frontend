import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);

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
            <h1>Danh sách sản phẩm</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <span>{product.name}</span>
                        <span className="price">{product.price} VND</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;