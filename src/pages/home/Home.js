import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import AddToCartModal from "../../components/products/AddToCartModal";
import "./Home.css";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [cartModalProduct, setCartModalProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosClient.get("/categories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchBestSellers = async () => {
            try {
                const response = await axiosClient.get("/products/bestsellers");
                setBestSellers(response.data);
            } catch (error) {
                console.error("Error fetching best sellers:", error);
            }
        };

        fetchCategories();
        fetchBestSellers();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/products/category/${categoryId}`);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleAddToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProduct = cart.find((item) => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        setCartModalProduct(product);
    };

    const closeCartModal = () => {
        setCartModalProduct(null);
    };

    const getGridClass = () => {
        if (categories.length === 3) return "categories-grid categories-grid-3";
        if (categories.length === 4) return "categories-grid categories-grid-4";
        if (categories.length === 5) return "categories-grid categories-grid-5";
        return "categories-grid";
    };

    const getBestSellerGridClass = () => {
        switch (bestSellers.length) {
            case 8:
                return "bestseller-grid bestseller-grid-8";
            case 7:
                return "bestseller-grid bestseller-grid-7";
            case 6:
                return "bestseller-grid bestseller-grid-6";
            case 5:
                return "bestseller-grid bestseller-grid-5";
            case 4:
                return "bestseller-grid bestseller-grid-4";
            case 3:
            case 2:
            case 1:
                return "bestseller-grid bestseller-grid-few";
            default:
                return "bestseller-grid";
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="home">
            <div className="categories-section">
                <h2>DANH MỤC</h2>
                <div className={getGridClass()}>
                    {categories.map((category) => (
                        <div
                            key={category.categoryId}
                            className="category-card"
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            <img
                                src={category.image || "https://placehold.co/200x200?text=" + category.name}
                                alt={category.name}
                                className="category-image"
                            />
                            <div className="category-label">{category.name}</div>
                        </div>
                    ))}
                </div>
            </div>
            {bestSellers.length > 0 && (
                <div className="bestseller-section">
                    <h2>SẢN PHẨM BÁN CHẠY</h2>
                    <div className={getBestSellerGridClass()}>
                        {bestSellers.length === 5 ? (
                            <>
                                {/* Hàng 1: 3 sản phẩm */}
                                {bestSellers.slice(0, 3).map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="bestseller-card"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <img
                                            src={product.image || "https://placehold.co/200x200"}
                                            alt={product.name}
                                            className="bestseller-image"
                                        />
                                        <div className="bestseller-info">
                                            <h3>{product.name}</h3>
                                            <p>{formatPrice(product.price)}</p>
                                            <button
                                                className="buy-now-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                            >
                                                Mua ngay
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Hàng 2: 2 sản phẩm căn giữa */}
                                <div className="bestseller-row-2">
                                    {bestSellers.slice(3, 5).map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="bestseller-card"
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            <img
                                                src={product.image || "https://placehold.co/200x200"}
                                                alt={product.name}
                                                className="bestseller-image"
                                            />
                                            <div className="bestseller-info">
                                                <h3>{product.name}</h3>
                                                <p>{formatPrice(product.price)}</p>
                                                <button
                                                    className="buy-now-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                >
                                                    Mua ngay
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            bestSellers.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`bestseller-card ${
                                        bestSellers.length === 8 && index < 2 ? "bestseller-card-large" : ""
                                    }`}
                                    onClick={() => handleProductClick(product.id)}
                                >
                                    <img
                                        src={product.image || "https://placehold.co/200x200"}
                                        alt={product.name}
                                        className="bestseller-image"
                                    />
                                    <div className="bestseller-info">
                                        <h3>{product.name}</h3>
                                        <p>{formatPrice(product.price)}</p>
                                        <button
                                            className="buy-now-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                        >
                                            Mua ngay
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {cartModalProduct && <AddToCartModal product={cartModalProduct} onClose={closeCartModal} />}
        </div>
    );
};

export default Home;