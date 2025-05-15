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

    // Determine the grid class based on the number of categories
    const getGridClass = () => {
        if (categories.length === 3) return "categories-grid categories-grid-3";
        if (categories.length === 4) return "categories-grid categories-grid-4";
        if (categories.length === 5) return "categories-grid categories-grid-5";
        return "categories-grid";
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