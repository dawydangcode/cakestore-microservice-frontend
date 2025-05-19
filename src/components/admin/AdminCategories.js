import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminCategories.css";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", description: "", image: null });
    const [editingRow, setEditingRow] = useState(null); // ID of category being edited
    const [editedCategory, setEditedCategory] = useState({}); // Data of category being edited
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [fileLabel, setFileLabel] = useState("Chọn hình ảnh");
    const [imagePreview, setImagePreview] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [selectedTab, setSelectedTab] = useState("list"); // "list" or "add"

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
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit) {
                    setEditedCategory(prev => ({ ...prev, image: file }));
                    setEditImagePreview(reader.result);
                } else {
                    setNewCategory({ ...newCategory, image: file });
                    setImagePreview(reader.result);
                    setFileLabel(file.name);
                }
            };
            reader.readAsDataURL(file);
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
            setImagePreview(null);
            fetchCategories();
            setSelectedTab("list");
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi thêm danh mục: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async (id) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category", JSON.stringify({ name: editedCategory.name, description: editedCategory.description }));
            if (editedCategory.image instanceof File) {
                formData.append("image", editedCategory.image);
            }
            const response = await axiosClient.put(`/categories/${id}`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage({ 
                type: "success", 
                text: `Đã cập nhật danh mục "${response.data.name}" thành công!` 
            });
            setEditingRow(null);
            setEditedCategory({});
            setEditImagePreview(null);
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

    const startEditing = (category) => {
        setEditingRow(category.categoryId);
        setEditedCategory({ ...category });
        setEditImagePreview(category.image || null);
    };

    const cancelEditing = () => {
        setEditingRow(null);
        setEditedCategory({});
        setEditImagePreview(null);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Quản lý danh mục</h1>
            </div>

            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <button 
                            className={`btn ${selectedTab === "list" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("list")}
                            style={{ marginRight: "10px" }}
                        >
                            Danh sách danh mục
                        </button>
                        <button 
                            className={`btn ${selectedTab === "add" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("add")}
                        >
                            Thêm danh mục mới
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {selectedTab === "add" && (
                    <div>
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
                                <label htmlFor="image">Hình ảnh</label>
                                <div className="file-input-wrapper">
                                    <span className="custom-file-input">
                                        {fileLabel}
                                    </span>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        onChange={(e) => handleFileChange(e)}
                                        accept="image/*"
                                    />
                                </div>
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                )}
                            </div>
                            
                            <div className="button-group">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Thêm danh mục"}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setNewCategory({ name: "", description: "", image: null });
                                        setFileLabel("Chọn hình ảnh");
                                        setImagePreview(null);
                                    }}
                                >
                                    Xóa form
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {selectedTab === "list" && (
                    <div>
                        <h2>Danh sách danh mục</h2>
                        <div className="category-table-container">
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
                                                {loading ? "Đang tải..." : "Không có danh mục nào"}
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map(category => {
                                            const isEditing = editingRow === category.categoryId;
                                            return (
                                                <tr key={category.categoryId}>
                                                    <td>{category.categoryId}</td>
                                                    <td>
                                                        {isEditing ? (
                                                            <div>
                                                                <div className="file-input-wrapper">
                                                                    <span className="custom-file-input">
                                                                        {editedCategory.image instanceof File ? editedCategory.image.name : "Chọn ảnh"}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleFileChange(e, true)}
                                                                    />
                                                                </div>
                                                                {editImagePreview && (
                                                                    <img 
                                                                        src={editImagePreview} 
                                                                        alt="Preview" 
                                                                        className="category-table-image" 
                                                                        style={{ marginTop: '8px' }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            category.image ? (
                                                                <img
                                                                    src={category.image}
                                                                    alt={category.name}
                                                                    className="category-table-image"
                                                                />
                                                            ) : (
                                                                <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                                                                    Không có hình ảnh
                                                                </div>
                                                            )
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editedCategory.name || ''}
                                                                onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                                                                className="inline-edit-input"
                                                            />
                                                        ) : (
                                                            category.name
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <textarea
                                                                value={editedCategory.description || ''}
                                                                onChange={(e) => setEditedCategory({ ...editedCategory, description: e.target.value })}
                                                                className="inline-edit-textarea"
                                                                placeholder="Nhập mô tả danh mục"
                                                            />
                                                        ) : (
                                                            category.description || (
                                                                <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                                                                    Không có mô tả
                                                                </span>
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="actions">
                                                        {isEditing ? (
                                                            <>
                                                                <button 
                                                                    className="table-btn edit-btn"
                                                                    onClick={() => handleEditCategory(category.categoryId)}
                                                                    disabled={loading}
                                                                >
                                                                    {loading ? "..." : "Lưu"}
                                                                </button>
                                                                <button 
                                                                    className="table-btn delete-btn"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    className="table-btn edit-btn"
                                                                    onClick={() => startEditing(category)}
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button 
                                                                    className="table-btn delete-btn"
                                                                    onClick={() => handleDeleteCategory(category.categoryId, category.name)}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCategories;