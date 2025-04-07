import React, { useState } from "react";
import axios from "../api/axiosClient";
import "./Admin.css";

const Admin = () => {
    const [product, setProduct] = useState({
        categoryId: "",
        name: "",
        description: "",
        price: "",
        stock: ""
    });
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/products/add", {
                categoryId: parseInt(product.categoryId),
                name: product.name,
                description: product.description,
                price: parseFloat(product.price),
                stock: parseInt(product.stock)
            }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
            setMessage({
                text: `Sản phẩm "${response.data.name}" đã được thêm thành công!`,
                type: "success"
            });
            setProduct({ categoryId: "", name: "", description: "", price: "", stock: "" });
        } catch (error) {
            setMessage({
                text: "Thêm sản phẩm thất bại: " + (error.response?.data?.message || error.message),
                type: "error"
            });
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome to the Admin page! Only users with ROLE_ADMIN can access this page.</p>
            </div>

            <div className="admin-form">
                <h2 className="form-title">Thêm sản phẩm mới</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category ID:</label>
                        <input
                            type="number"
                            name="categoryId"
                            value={product.categoryId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tên sản phẩm:</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mô tả:</label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Giá:</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Số lượng tồn kho:</label>
                        <input
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Thêm sản phẩm</button>
                </form>
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;