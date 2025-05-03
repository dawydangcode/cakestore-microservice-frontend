import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminCategories.css";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "", image: null });
    const [editCategory, setEditCategory] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [fileLabel, setFileLabel] = useState("Chọn hình ảnh");
    const [editFileLabel, setEditFileLabel] = useState("Chọn hình ảnh mới");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/categories");
            setCategories(response.data);
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi lấy danh sách danh mục: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            if (isEdit) {
                setEditCategory({ ...editCategory, image: file });
                setEditFileLabel(file.name);
            } else {
                setNewCategory({ ...newCategory, image: file });
                setFileLabel(file.name);
            }
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category", JSON.stringify({ name: newCategory.name, description: newCategory.description }));
            if (newCategory.image) {
                formData.append("image", newCategory.image);
            }
            const response = await axiosClient.post("/categories", formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage({ 
                type: "success", 
                text: `Đã thêm danh mục "${response.data.name}" thành công!` 
            });
            setNewCategory({ name: "", description: "", image: null });
            setFileLabel("Chọn hình ảnh");
            fetchCategories();
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi thêm danh mục: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category", JSON.stringify({ name: editCategory.name, description: editCategory.description }));
            if (editCategory.image instanceof File) {
                formData.append("image", editCategory.image);
            }
            const response = await axiosClient.put(`/categories/${editCategory.categoryId}`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage({ 
                type: "success", 
                text: `Đã cập nhật danh mục "${response.data.name}" thành công!` 
            });
            setEditCategory(null);
            setEditFileLabel("Chọn hình ảnh mới");
            fetchCategories();
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi cập nhật danh mục: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (window.confirm(`Bạn chắc chắn muốn xóa danh mục "${name}"?`)) {
            setLoading(true);
            try {
                await axiosClient.delete(`/categories/${id}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setMessage({ 
                    type: "success", 
                    text: `Đã xóa danh mục "${name}" thành công!` 
                });
                fetchCategories();
            } catch (error) {
                setMessage({ 
                    type: "error", 
                    text: "Lỗi khi xóa danh mục: " + (error.response?.data || error.message) 
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const startEditCategory = (category) => {
        setEditCategory(category);
        setEditFileLabel("Chọn hình ảnh mới");
    };

    return (
        <div>
            <h1>Quản lý danh mục</h1>
            
            {message.text && (
                <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
                    {message.text}
                </div>
            )}

            <div className="admin-section">
                <h2>Thêm danh mục mới</h2>
                <form onSubmit={handleAddCategory} className="admin-form">
                    <div className="form-group">
                        <label htmlFor="name">Tên danh mục</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="Nhập tên danh mục"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Nhập mô tả danh mục"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Hình ảnh</label>
                        <div className="file-input-wrapper">
                            <label className="file-input-label">
                                📁 {fileLabel}
                            </label>
                            <input
                                type="file"
                                name="image"
                                onChange={(e) => handleFileChange(e)}
                                accept="image/*"
                            />
                        </div>
                    </div>
                    
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Thêm danh mục"}
                        </button>
                    </div>
                </form>
            </div>

            {editCategory && (
                <div className="admin-section">
                    <h2>Sửa danh mục</h2>
                    <form onSubmit={handleEditCategory} className="admin-form">
                        <div className="form-group">
                            <label htmlFor="edit-name">Tên danh mục</label>
                            <input
                                id="edit-name"
                                type="text"
                                name="name"
                                value={editCategory.name}
                                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                placeholder="Nhập tên danh mục"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="edit-description">Mô tả</label>
                            <textarea
                                id="edit-description"
                                name="description"
                                value={editCategory.description}
                                onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                                placeholder="Nhập mô tả danh mục"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Hình ảnh</label>
                            <div className="file-input-wrapper">
                                <label className="file-input-label">
                                    📁 {editFileLabel}
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={(e) => handleFileChange(e, true)}
                                    accept="image/*"
                                />
                            </div>
                            
                            {editCategory.image && typeof editCategory.image === "string" && (
                                <div className="image-preview">
                                    <img
                                        src={editCategory.image}
                                        alt={editCategory.name}
                                        className="table-img"
                                        style={{ width: "100%", height: "auto" }}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="button-group">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Cập nhật"}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setEditCategory(null)}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-section">
                <h2>Danh sách danh mục</h2>
                
                {loading && !categories.length ? (
                    <p>Đang tải danh mục...</p>
                ) : (
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Hình ảnh</th>
                                <th>Tên</th>
                                <th>Mô tả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        Không có danh mục nào
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.categoryId}>
                                        <td>{category.categoryId}</td>
                                        <td>
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="table-img"
                                                />
                                            ) : (
                                                <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                                    Không có hình ảnh
                                                </div>
                                            )}
                                        </td>
                                        <td>{category.name}</td>
                                        <td>
                                            {category.description || (
                                                <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                                                    Không có mô tả
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => startEditCategory(category)}
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteCategory(category.categoryId, category.name)}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminCategories;