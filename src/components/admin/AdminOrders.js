import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./AdminOrders.css";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axiosClient.get("/orders/all", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setOrders(response.data);
        } catch (error) {
            setMessage("Lỗi khi lấy danh sách đơn hàng: " + (error.response?.data || error.message));
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            setMessage(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
            fetchOrders();
            setEditingOrder(null);
        } catch (error) {
            setMessage("Lỗi khi cập nhật trạng thái: " + (error.response?.data || error.message));
        }
    };

    const statusOptions = ["Chờ thanh toán", "Đã thanh toán", "Thanh toán thất bại", "Hủy"];

    return (
        <div>
            <h1>Quản lý đơn hàng</h1>
            {message && <p>{message}</p>}
            <div className="admin-section">
                <h2>Danh sách đơn hàng</h2>
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
                                <td>{order.id}</td>
                                <td>{order.fullName}</td>
                                <td>{order.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                <td>
                                    {editingOrder && editingOrder.id === order.id ? (
                                        <select
                                            value={editingOrder.status}
                                            onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        order.status
                                    )}
                                </td>
                                <td>{order.paymentMethod || "Không xác định"}</td>
                                <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                                <td>
                                    {editingOrder && editingOrder.id === order.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, editingOrder.status)}
                                            >
                                                Lưu
                                            </button>
                                            <button
                                                onClick={() => setEditingOrder(null)}
                                            >
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditingOrder(order)}
                                        >
                                            Sửa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;