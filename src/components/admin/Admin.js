import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        categoryId: "", name: "", description: "", price: "", stock: "", image: null
    });
    const [editProduct, setEditProduct] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8080/products/list", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setProducts(response.data);
        } catch (error) {
            setMessage("Lỗi khi lấy danh sách sản phẩm: " + error.message);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/categories");
            setCategories(response.data);
        } catch (error) {
            setMessage("Lỗi khi lấy danh sách danh mục: " + error.message);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("product", JSON.stringify({
                categoryId: parseInt(newProduct.categoryId),
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            }));
            if (newProduct.image) {
                formData.append("image", newProduct.image);
            }

            const response = await axios.post("http://localhost:8080/products/add", formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage(`Đã thêm "${response.data.name}" thành công!`);
            setNewProduct({ categoryId: "", name: "", description: "", price: "", stock: "", image: null });
            fetchProducts();
        } catch (error) {
            setMessage("Lỗi khi thêm sản phẩm: " + (error.response?.data || error.message));
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("product", JSON.stringify({
                categoryId: parseInt(editProduct.categoryId),
                name: editProduct.name,
                description: editProduct.description,
                price: parseFloat(editProduct.price),
                stock: parseInt(editProduct.stock)
            }));
            if (editProduct.image instanceof File) {
                formData.append("image", editProduct.image);
            }

            const response = await axios.put(`http://localhost:8080/products/update/${editProduct.id}`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            setMessage(`Đã cập nhật "${response.data.name}" thành công!`);
            setEditProduct(null);
            fetchProducts();
        } catch (error) {
            setMessage("Lỗi khi cập nhật sản phẩm: " + (error.response?.data || error.message));
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
            try {
                await axios.delete(`http://localhost:8080/products/delete/${id}`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setMessage("Xóa sản phẩm thành công!");
                fetchProducts();
            } catch (error) {
                setMessage("Lỗi khi xóa sản phẩm: " + (error.response?.data || error.message));
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : "Không xác định";
    };

    const handleImageChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (isEdit) {
            setEditProduct({ ...editProduct, image: file });
        } else {
            setNewProduct({ ...newProduct, image: file });
        }
    };

    return (
        <div>
            <h1>Quản lý sản phẩm</h1>
            <div className="admin-section">
                <h2>Thêm sản phẩm mới</h2>
                <form onSubmit={handleAddProduct} className="admin-form">
                    <select
                        name="categoryId"
                        value={newProduct.categoryId}
                        onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                        required
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Tên sản phẩm"
                        required
                    />
                    <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Mô tả"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="Giá"
                        required
                    />
                    <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        placeholder="Tồn kho"
                        required
                    />
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e)}
                    />
                    <button type="submit">Thêm</button>
                </form>
            </div>

            {editProduct && (
                <div className="admin-section">
                    <h2>Sửa sản phẩm</h2>
                    <form onSubmit={handleEditProduct} className="admin-form">
                        <select
                            name="categoryId"
                            value={editProduct.categoryId}
                            onChange={(e) => setEditProduct({...editProduct, categoryId: parseInt(e.target.value)})}
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(category => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="name"
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                            required
                        />
                        <textarea
                            name="description"
                            value={editProduct.description}
                            onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                        />
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={editProduct.price}
                            onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value)})}
                            required
                        />
                        <input
                            type="number"
                            name="stock"
                            value={editProduct.stock}
                            onChange={(e) => setEditProduct({...editProduct, stock: parseInt(e.target.value)})}
                            required
                        />
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, true)}
                        />
                        <button type="submit">Cập nhật</button>
                        <button type="button" onClick={() => setEditProduct(null)}>Hủy</button>
                    </form>
                </div>
            )}

            <div className="admin-section">
                <h2>Danh sách sản phẩm</h2>
                {message && <p>{message}</p>}
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên</th>
                            <th>Loại</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <img
                                        src={product.image || "https://placehold.co/80x80"}
                                        alt={product.name}
                                        className="product-table-image"
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category ? product.category.name : getCategoryName(product.categoryId)}</td>
                                <td>{product.price}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <button onClick={() => setEditProduct(product)}>Sửa</button>
                                    <button onClick={() => handleDeleteProduct(product.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;