import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminOrders.css";
import { AlertCircle, Check, X, Edit2, Save, RefreshCw } from "lucide-react";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success, error
    const [editingOrder, setEditingOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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
            
            // Auto hide success message after 3 seconds
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
        </div>
    );
};

export default AdminOrders;