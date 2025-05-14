import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminOrders.css";
import { AlertCircle, Check, X, Edit2, Save, RefreshCw, Eye } from "lucide-react";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success, error
    const [editingOrder, setEditingOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get("/orders/all", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            setMessageType("error");
            setMessage("Lỗi khi lấy danh sách đơn hàng: " + (error.response?.data || error.message));
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setMessageType("success");
            setMessage(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
            fetchOrders();
            setEditingOrder(null);

            setTimeout(() => {
                if (messageType === "success") {
                    setMessage("");
                    setMessageType("");
                }
            }, 3000);
        } catch (error) {
            setMessageType("error");
            setMessage("Lỗi khi cập nhật trạng thái: " + (error.response?.data || error.message));
        }
    };

    const handleRefresh = () => {
        fetchOrders();
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Chờ thanh toán":
                return "status-pending";
            case "Đã thanh toán":
                return "status-paid";
            case "Thanh toán thất bại":
                return "status-failed";
            case "Hủy":
                return "status-cancelled";
            default:
                return "";
        }
    };

    const statusOptions = ["Chờ thanh toán", "Đã thanh toán", "Thanh toán thất bại", "Hủy"];

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedOrder(null);
    };

    return (
        <div className="admin-orders-container">
            <div className="admin-header">
                <h1>Quản lý đơn hàng</h1>
                <button className="refresh-button" onClick={handleRefresh}>
                    <RefreshCw size={16} />
                    <span>Làm mới</span>
                </button>
            </div>
            
            {message && (
                <div className={`message-alert ${messageType}`}>
                    {messageType === "error" ? (
                        <AlertCircle size={20} />
                    ) : (
                        <Check size={20} />
                    )}
                    <span>{message}</span>
                    <button onClick={() => { setMessage(""); setMessageType(""); }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="admin-content">
                <div className="card">
                    <div className="card-header">
                        <h2>Danh sách đơn hàng</h2>
                    </div>
                    
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <p>Không có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="order-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Phương thức thanh toán</th>
                                        <th>Ngày tạo</th>
                                        <th>Chi tiết</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.fullName}</td>
                                            <td className="price-column">{order.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                            <td>
                                                {editingOrder && editingOrder.id === order.id ? (
                                                    <select
                                                        className="status-select"
                                                        value={editingOrder.status}
                                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{order.paymentMethod || "Không xác định"}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td className="action-column">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                            <td className="action-column">
                                                {editingOrder && editingOrder.id === order.id ? (
                                                    <>
                                                        <button
                                                            className="btn-save"
                                                            onClick={() => handleUpdateStatus(order.id, editingOrder.status)}
                                                            title="Lưu thay đổi"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-cancel"
                                                            onClick={() => setEditingOrder(null)}
                                                            title="Hủy chỉnh sửa"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => setEditingOrder(order)}
                                                        title="Chỉnh sửa trạng thái"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal chi tiết đơn hàng */}
            {showDetails && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                            <button className="modal-close" onClick={handleCloseDetails}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Khách hàng:</strong> {selectedOrder.fullName}</p>
                            <p><strong>Tổng tiền:</strong> {selectedOrder.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || "Không xác định"}</p>
                            <p><strong>Ngày tạo:</strong> {formatDate(selectedOrder.createdAt)}</p>
                            <p><strong>Trạng thái:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                            <h3>Sản phẩm trong đơn hàng</h3>
                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                <table className="order-details-table">
                                    <thead>
                                        <tr>
                                            <th>Hình ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Số lượng</th>
                                            <th>Giá</th>
                                            <th>Tổng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.orderItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <img
                                                        src={item.image || "https://placehold.co/50x50"}
                                                        alt={item.productName || "Sản phẩm"}
                                                        className="product-image"
                                                    />
                                                </td>
                                                <td>{item.productName || "Không xác định"}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                                <td>{(item.quantity * item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>Không có sản phẩm nào trong đơn hàng này.</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close" onClick={handleCloseDetails}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;