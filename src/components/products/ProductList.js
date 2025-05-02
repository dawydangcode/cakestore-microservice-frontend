import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductList.css";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { categoryId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    axiosClient.get("/products/list"),
                    axiosClient.get("/categories")
                ]);
                setProducts(
                    categoryId
                        ? productsResponse.data.filter((p) => p.categoryId === parseInt(categoryId))
                        : productsResponse.data
                );
                setCategories(categoriesResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [categoryId]);

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`${product.name} đã được thêm vào giỏ hàng!`);
    };

    const handleCategoryClick = (categoryId) => {
        if (categoryId) {
            navigate(`/products/category/${categoryId}`);
        } else {
            navigate("/products");
        }
    };

    return (
        <div className="parent">
            <div className="div1">
                <h3>Danh mục</h3>
                <ul className="category-list">
                    <li
                        className={!categoryId ? "active" : ""}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Tất cả
                    </li>
                    {categories.map((category) => (
                        <li
                            key={category.categoryId}
                            className={categoryId && parseInt(categoryId) === category.categoryId ? "active" : ""}
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="div2 product-list">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <img
                            src={product.image || "https://placehold.co/200x200"}
                            alt={product.name}
                            className="product-image"
                        />
                        <h3>{product.name}</h3>
                        <p>Price: {product.price.toLocaleString()}đ</p>
                        <button onClick={() => navigate(`/product/${product.id}`)}>
                            Chi tiết
                        </button>
                        <button onClick={() => handleAddToCart(product)}>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;