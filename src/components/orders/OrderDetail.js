import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./OrderDetail.css";

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [productNames, setProductNames] = useState({});

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await axiosClient.get(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error("Failed to fetch order detail:", error);
            }
        };

        const fetchProductNames = async () => {
            if (!order || !order.orderItems) return;
            const names = {};
            for (const item of order.orderItems) {
                try {
                    const productResponse = await axiosClient.get(`/products/${item.productId}`);
                    names[item.productId] = productResponse.data.name || `Sản phẩm #${item.productId}`;
                } catch (error) {
                    console.error(`Failed to fetch product ${item.productId}:`, error);
                    names[item.productId] = `Sản phẩm #${item.productId}`;
                }
            }
            setProductNames(names);
        };

        fetchOrderDetail();
        if (order) fetchProductNames();
    }, [orderId, order]);

    if (!order) return <div>Loading...</div>;

    return (
        <div className="order-detail">
            <h2>Chi tiết đơn hàng #{order.id}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Mã sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {order.orderItems.map((item) => (
                        <tr key={item.id}>
                            <td>{productNames[item.productId] || `Sản phẩm #${item.productId}`}</td>
                            <td>{item.productId}</td>
                            <td>{item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="order-summary">
                <p>Giá sản phẩm: {order.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                <p>Giao hàng tận nơi: 80,000₫</p>
                <p><strong>Tổng tiền: {(order.totalPrice + 80000).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong></p>
            </div>
            <div className="order-address">
                <h3>Địa chỉ thanh toán</h3>
                <p>Tình trạng thanh toán: {order.status}</p>
                <p>{order.fullName}</p>
                <p>Địa chỉ: {order.address}</p>
                <p>Tỉnh/thành phố: {order.district}</p>
                <p>Số điện thoại: {order.phoneNumber}</p>
                <p>Email: {order.userName}@example.com</p>
            </div>
        </div>
    );
};

export default OrderDetail;