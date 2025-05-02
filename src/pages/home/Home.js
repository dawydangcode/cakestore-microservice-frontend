import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./Home.css";

const Home = () => {
    const [categories, setCategories] = useState([]);
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
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId) => {
        navigate(`/products/category/${categoryId}`);
    };

    return (
        <div className="home">
            <div className="categories-section">
                <h2>DANH MỤC</h2>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <div
                            key={category.categoryId}
                            className="category-card"
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            <div className="category-image-wrapper">
                                <img
                                    src={category.image || "https://placehold.co/200x200?text=" + category.name}
                                    alt={category.name}
                                    className="category-image"
                                />
                            </div>
                            <div className="category-label">
                                {category.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;