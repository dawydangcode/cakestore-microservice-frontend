import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminCategories.css";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [editCategory, setEditCategory] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axiosClient.get("/categories");
            setCategories(response.data);
        } catch (error) {
            setMessage("Lỗi khi lấy danh sách danh mục: " + (error.response?.data || error.message));
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post("/categories", newCategory, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage(`Đã thêm danh mục "${response.data.name}" thành công!`);
            setNewCategory({ name: "", description: "" });
            fetchCategories();
        } catch (error) {
            setMessage("Lỗi khi thêm danh mục: " + (error.response?.data || error.message));
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.put(`/categories/${editCategory.id}`, editCategory, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage(`Đã cập nhật danh mục "${response.data.name}" thành công!`);
            setEditCategory(null);
            fetchCategories();
        } catch (error) {
            setMessage("Lỗi khi cập nhật danh mục: " + (error.response?.data || error.message));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
            try {
                await axiosClient.delete(`/categories/${id}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setMessage("Xóa danh mục thành công!");
                fetchCategories();
            } catch (error) {
                setMessage("Lỗi khi xóa danh mục: " + (error.response?.data || error.message));
            }
        }
    };

    return (
        <div>
            <h1>Quản lý danh mục</h1>
            <div className="admin-section">
                <h2>Thêm danh mục mới</h2>
                <form onSubmit={handleAddCategory} className="admin-form">
                    <input
                        type="text"
                        name="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Tên danh mục"
                        required
                    />
                    <textarea
                        name="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Mô tả"
                    />
                    <button type="submit">Thêm</button>
                </form>
            </div>

            {editCategory && (
                <div className="admin-section">
                    <h2>Sửa danh mục</h2>
                    <form onSubmit={handleEditCategory} className="admin-form">
                        <input
                            type="text"
                            name="name"
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            placeholder="Tên danh mục"
                            required
                        />
                        <textarea
                            name="description"
                            value={editCategory.description}
                            onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                            placeholder="Mô tả"
                        />
                        <button type="submit">Cập nhật</button>
                        <button type="button" onClick={() => setEditCategory(null)}>Hủy</button>
                    </form>
                </div>
            )}

            <div className="admin-section">
                <h2>Danh sách danh mục</h2>
                {message && <p>{message}</p>}
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Mô tả</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.categoryId}>
                                <td>{category.categoryId}</td>
                                <td>{category.name}</td>
                                <td>{category.description || "Không có mô tả"}</td>
                                <td>
                                    <button onClick={() => setEditCategory(category)}>Sửa</button>
                                    <button onClick={() => handleDeleteCategory(category.categoryId)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;