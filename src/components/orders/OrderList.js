import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";
import "./OrderList.css";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { userName } = useContext(AuthContext); // Lấy userName từ AuthContext

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosClient.get(`/orders/user/${userName}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };
        if (userName) fetchOrders();
    }, [userName]);

    const handleViewDetail = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    return (
        <div className="order-list">
            <h2>Đơn hàng của bạn</h2>
            {orders.length === 0 ? (
                <p>Không có đơn hàng nào.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Thời gian</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>
                                    <span onClick={() => handleViewDetail(order.id)} style={{ cursor: "pointer", color: "#ff5733" }}>
                                        {order.id}
                                    </span>
                                </td>
                                <td>{order.createdAt}</td>
                                <td>{order.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                                <td>{order.status}</td>
                                <td>
                                    <button onClick={() => handleViewDetail(order.id)}>Xem chi tiết</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderList;