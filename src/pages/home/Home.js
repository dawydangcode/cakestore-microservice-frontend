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
                <h2>Danh mục</h2>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <div
                            key={category.categoryId}
                            className="category-card"
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            <img
                                src={`https://placehold.co/200x200?text=${category.name}`}
                                alt={category.name}
                                className="category-image"
                            />
                            <p>{category.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;