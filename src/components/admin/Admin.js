// src/components/admin/Admin.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        categoryId: "", name: "", description: "", price: "", stock: ""
    });
    const [editProduct, setEditProduct] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProducts();
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

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/products/add", {
                categoryId: parseInt(newProduct.categoryId),
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage(`Đã thêm "${response.data.name}" thành công!`);
            setNewProduct({ categoryId: "", name: "", description: "", price: "", stock: "" });
            fetchProducts();
        } catch (error) {
            setMessage("Lỗi khi thêm sản phẩm: " + (error.response?.data || error.message));
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:8080/products/update/${editProduct.id}`, editProduct, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
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

    return (
        <div>
            <h1>Quản lý sản phẩm</h1>
            <div className="admin-section">
                <h2>Thêm sản phẩm mới</h2>
                <form onSubmit={handleAddProduct} className="admin-form">
                    <input type="number" name="categoryId" value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})} placeholder="Category ID" required />
                    <input type="text" name="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="Tên sản phẩm" required />
                    <textarea name="description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Mô tả" />
                    <input type="number" step="0.01" name="price" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="Giá" required />
                    <input type="number" name="stock" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} placeholder="Tồn kho" required />
                    <button type="submit">Thêm</button>
                </form>
            </div>

            {editProduct && (
                <div className="admin-section">
                    <h2>Sửa sản phẩm</h2>
                    <form onSubmit={handleEditProduct} className="admin-form">
                        <input type="number" name="categoryId" value={editProduct.categoryId} onChange={(e) => setEditProduct({...editProduct, categoryId: parseInt(e.target.value)})} required />
                        <input type="text" name="name" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} required />
                        <textarea name="description" value={editProduct.description} onChange={(e) => setEditProduct({...editProduct, description: e.target.value})} />
                        <input type="number" step="0.01" name="price" value={editProduct.price} onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value)})} required />
                        <input type="number" name="stock" value={editProduct.stock} onChange={(e) => setEditProduct({...editProduct, stock: parseInt(e.target.value)})} required />
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
                            <th>Tên</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
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