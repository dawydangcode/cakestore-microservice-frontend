import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [inactiveProducts, setInactiveProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        categoryId: "", name: "", description: "", price: "", stock: "", image: null, isBestSeller: false
    });
    const [editingRow, setEditingRow] = useState(null);
    const [editedProduct, setEditedProduct] = useState({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [selectedTab, setSelectedTab] = useState("list");

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBestSellers();
        fetchInactiveProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/products/list", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setProducts(response.data);
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi lấy danh sách sản phẩm: " + error.message 
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchBestSellers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/products/bestsellers", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setBestSellers(response.data);
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi lấy danh sách Best Seller: " + error.message 
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchInactiveProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/products/inactive", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setInactiveProducts(response.data);
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi lấy danh sách sản phẩm đã ẩn: " + error.message 
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/categories");
            setCategories(response.data);
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi lấy danh sách danh mục: " + error.message 
            });
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("product", JSON.stringify({
                categoryId: parseInt(newProduct.categoryId),
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                isBestSeller: newProduct.isBestSeller || false,
                status: "ACTIVE"
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
            setMessage({ 
                type: "success", 
                text: `Đã thêm "${response.data.name}" thành công! ${response.data.stock <= 0 ? "Sản phẩm đã được ẩn do hết hàng." : ""}` 
            });
            setNewProduct({ categoryId: "", name: "", description: "", price: "", stock: "", image: null, isBestSeller: false });
            setImagePreview(null);
            fetchProducts();
            fetchInactiveProducts();
            setSelectedTab("list");
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi thêm sản phẩm: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = async (id) => {
        setLoading(true);
        try {
            const productToUpdate = editedProduct;
            
            const formData = new FormData();
            formData.append("product", JSON.stringify({
                categoryId: parseInt(productToUpdate.categoryId),
                name: productToUpdate.name,
                description: productToUpdate.description,
                price: parseFloat(productToUpdate.price),
                stock: parseInt(productToUpdate.stock),
                isBestSeller: productToUpdate.isBestSeller ?? false
            }));
            
            if (productToUpdate.image instanceof File) {
                formData.append("image", productToUpdate.image);
            }

            const response = await axios.put(`http://localhost:8080/products/update/${id}`, formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            
            setMessage({ 
                type: "success", 
                text: `Đã cập nhật "${response.data.name}" thành công! ${response.data.stock <= 0 ? "Sản phẩm đã được ẩn do hết hàng." : response.data.stock > 0 && response.data.status === "ACTIVE" ? "Sản phẩm đã được khôi phục do có hàng." : ""}` 
            });
            setEditingRow(null);
            setEditedProduct({});
            setEditImagePreview(null);
            fetchProducts();
            fetchBestSellers();
            fetchInactiveProducts();
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi cập nhật sản phẩm: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSetBestSeller = async (id, isBestSeller) => {
        setLoading(true);
        try {
            const response = await axios.put(`http://localhost:8080/products/bestseller/${id}`, null, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
                params: { isBestSeller }
            });
            setMessage({ type: "success", text: response.data });
            fetchBestSellers();
            fetchProducts();
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: "Lỗi khi cập nhật Best Seller: " + (error.response?.data || error.message) 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleHideProduct = async (id, name) => {
        if (window.confirm(`Bạn chắc chắn muốn ẩn sản phẩm "${name}"?`)) {
            setLoading(true);
            try {
                await axios.put(`http://localhost:8080/products/hide/${id}`, null, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setMessage({ type: "success", text: `Đã ẩn sản phẩm "${name}" thành công!` });
                fetchProducts();
                fetchBestSellers();
                fetchInactiveProducts();
            } catch (error) {
                setMessage({ 
                    type: "error", 
                    text: "Lỗi khi ẩn sản phẩm: " + (error.response?.data || error.message) 
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRestoreProduct = async (id, name) => {
        if (window.confirm(`Bạn chắc chắn muốn khôi phục sản phẩm "${name}"?`)) {
            setLoading(true);
            try {
                const response = await axios.put(`http://localhost:8080/products/restore/${id}`, null, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                setMessage({ 
                    type: "success", 
                    text: `Đã khôi phục sản phẩm "${name}" thành công! Tồn kho được đặt thành 1.`
                });
                fetchProducts();
                fetchBestSellers();
                fetchInactiveProducts();
            } catch (error) {
                console.error("Error restoring product:", error);
                setMessage({ 
                    type: "error", 
                    text: `Lỗi khi khôi phục sản phẩm: ${error.response?.data || error.message}` 
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : "Không xác định";
    };

    const handleImageChange = (e, isEdit = false, productId = null) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit && productId) {
                    setEditedProduct(prev => ({ ...prev, image: file }));
                    setEditImagePreview(reader.result);
                } else {
                    setNewProduct({ ...newProduct, image: file });
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const startEditing = (product) => {
        setEditingRow(product.id);
        setEditedProduct({ ...product, isBestSeller: product.isBestSeller ?? false });
        setEditImagePreview(product.image);
    };
    
    const cancelEditing = () => {
        setEditingRow(null);
        setEditedProduct({});
        setEditImagePreview(null);
    };

    const getStockStatus = (stock) => {
        if (stock <= 0) return { class: "out-of-stock", text: "Hết hàng" };
        if (stock < 10) return { class: "low-stock", text: "Sắp hết" };
        return { class: "in-stock", text: "Còn hàng" };
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Quản lý sản phẩm</h1>
            </div>

            <div className="admin-section">
                <div className="admin-section-header">
                    <div>
                        <button 
                            className={`btn ${selectedTab === "list" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("list")}
                            style={{ marginRight: "10px" }}
                        >
                            Danh sách sản phẩm
                        </button>
                        <button 
                            className={`btn ${selectedTab === "add" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("add")}
                            style={{ marginRight: "10px" }}
                        >
                            Thêm sản phẩm mới
                        </button>
                        <button 
                            className={`btn ${selectedTab === "bestseller" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("bestseller")}
                            style={{ marginRight: "10px" }}
                        >
                            Best Seller
                        </button>
                        <button 
                            className={`btn ${selectedTab === "inactive" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setSelectedTab("inactive")}
                        >
                            Sản phẩm đã ẩn
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`message message-${message.type}`}>
                        {message.text}
                        <button
                            className="close-message"
                            onClick={() => setMessage({ type: "", text: "" })}
                        >×</button>
                    </div>
                )}

                {selectedTab === "add" && (
                    <div>
                        <h2>Thêm sản phẩm mới</h2>
                        <form onSubmit={handleAddProduct} className="admin-form">
                            <div className="form-group">
                                <label htmlFor="categoryId">Danh mục</label>
                                <select
                                    id="categoryId"
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
                            </div>
                            <div className="form-group">
                                <label htmlFor="name">Tên sản phẩm</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Mô tả</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                    placeholder="Nhập mô tả sản phẩm"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    id="price"
                                    step="1000"
                                    min="0"
                                    name="price"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                    placeholder="Nhập giá sản phẩm"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="stock">Tồn kho</label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    min="0"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({
                                        ...newProduct, 
                                        stock: e.target.value === '' ? '' : parseInt(e.target.value)
                                    })}
                                    placeholder="Nhập số lượng tồn kho"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="image">Hình ảnh</label>
                                <div className="file-input-wrapper">
                                    <span className="custom-file-input">
                                        {newProduct.image ? newProduct.image.name : "Chọn file"}
                                    </span>
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e)}
                                    />
                                </div>
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                )}
                            </div>
                            <div className="button-group">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setNewProduct({ categoryId: "", name: "", description: "", price: "", stock: "", image: null, isBestSeller: false });
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
                        <h2>Danh sách sản phẩm</h2>
                        <div className="product-table-container">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th>Trạng thái</th>
                                        <th>Best Seller</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: "center" }}>
                                                {loading ? "Đang tải..." : "Không có sản phẩm nào"}
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(product => {
                                            const stockStatus = getStockStatus(product.stock);
                                            const isEditing = editingRow === product.id;
                                            
                                            return (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>
                                                        {isEditing ? (
                                                            <div>
                                                                <div className="file-input-wrapper">
                                                                    <span className="custom-file-input">
                                                                        {editedProduct.image instanceof File ? editedProduct.image.name : "Chọn ảnh"}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleImageChange(e, true, product.id)}
                                                                    />
                                                                </div>
                                                                {editImagePreview && (
                                                                    <img 
                                                                        src={editImagePreview} 
                                                                        alt="Preview" 
                                                                        className="product-table-image" 
                                                                        style={{ marginTop: '8px' }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={product.image || "https://placehold.co/60x60"}
                                                                alt={product.name}
                                                                className="product-table-image"
                                                            />
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editedProduct.name || ''}
                                                                onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                                                                className="inline-edit-input"
                                                            />
                                                        ) : (
                                                            product.name
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <select
                                                                value={editedProduct.categoryId || ''}
                                                                onChange={(e) => setEditedProduct({...editedProduct, categoryId: parseInt(e.target.value)})}
                                                                className="inline-edit-select"
                                                            >
                                                                {categories.map(category => (
                                                                    <option key={category.categoryId} value={category.categoryId}>
                                                                        {category.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            product.category ? product.category.name : getCategoryName(product.categoryId)
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                step="1000"
                                                                min="0"
                                                                value={editedProduct.price || ''}
                                                                onChange={(e) => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})}
                                                                className="inline-edit-input"
                                                            />
                                                        ) : (
                                                            formatPrice(product.price)
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editedProduct.stock !== undefined ? editedProduct.stock : ''}
                                                                onChange={(e) => setEditedProduct({
                                                                    ...editedProduct, 
                                                                    stock: e.target.value === '' ? '' : parseInt(e.target.value)
                                                                })}
                                                                className="inline-edit-input"
                                                            />
                                                        ) : (
                                                            product.stock
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${stockStatus.class}`}>
                                                            {stockStatus.text}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={product.isBestSeller ?? false}
                                                            onChange={(e) => handleSetBestSeller(product.id, e.target.checked)}
                                                            disabled={loading || (!(product.isBestSeller ?? false) && bestSellers.length >= 8)}
                                                        />
                                                    </td>
                                                    <td className="actions">
                                                        {isEditing ? (
                                                            <>
                                                                <button 
                                                                    className="table-btn edit-btn"
                                                                    onClick={() => handleEditProduct(product.id)}
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
                                                                    onClick={() => startEditing(product)}
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button 
                                                                    className="table-btn delete-btn"
                                                                    onClick={() => handleHideProduct(product.id, product.name)}
                                                                >
                                                                    Ẩn
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

                {selectedTab === "bestseller" && (
                    <div>
                        <h2>Quản lý Best Seller (Tối đa 8 sản phẩm)</h2>
                        <p>Số lượng Best Seller hiện tại: {bestSellers.length}/8</p>
                        <div className="product-table-container">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bestSellers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center" }}>
                                                {loading ? "Đang tải..." : "Chưa có sản phẩm Best Seller"}
                                            </td>
                                        </tr>
                                    ) : (
                                        bestSellers.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>
                                                    <img
                                                        src={product.image || "https://placehold.co/60x60"}
                                                        alt={product.name}
                                                        className="product-table-image"
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.category ? product.category.name : getCategoryName(product.categoryId)}</td>
                                                <td>{formatPrice(product.price)}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <button
                                                        className="table-btn delete-btn"
                                                        onClick={() => handleSetBestSeller(product.id, false)}
                                                        disabled={loading}
                                                    >
                                                        Xóa khỏi Best Seller
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === "inactive" && (
                    <div>
                        <h2>Sản phẩm đã ẩn</h2>
                        <div className="product-table-container">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center" }}>
                                                {loading ? "Đang tải..." : "Chưa có sản phẩm nào bị ẩn"}
                                            </td>
                                        </tr>
                                    ) : (
                                        inactiveProducts.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>
                                                    <img
                                                        src={product.image || "https://placehold.co/60x60"}
                                                        alt={product.name}
                                                        className="product-table-image"
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.category ? product.category.name : getCategoryName(product.categoryId)}</td>
                                                <td>{formatPrice(product.price)}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <button
                                                        className="table-btn edit-btn"
                                                        onClick={() => handleRestoreProduct(product.id, product.name)}
                                                        disabled={loading}
                                                    >
                                                        Khôi phục
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
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

export default Admin;