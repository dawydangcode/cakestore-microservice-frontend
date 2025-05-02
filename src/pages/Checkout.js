import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axiosClient from "../api/axiosClient";
import "./Checkout.css";

const districts = [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7",
    "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Quận Bình Tân",
    "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình",
    "Quận Tân Phú", "Quận Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ",
    "Huyện Củ Chi", "Huyện Hóc Môn", "Huyện Nhà Bè"
];

const Checkout = () => {
    const { cart, syncCartWithBackend } = useContext(CartContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        district: "",
        address: "",
        note: "",
        paymentMethod: "COD"
    });

    const [errors, setErrors] = useState({});

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return total + price * quantity;
        }, 0).toFixed(0);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc";
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Điện thoại là bắt buộc";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Điện thoại phải là số và có 10 chữ số";
        }
        if (!formData.district) newErrors.district = "Quận/Huyện là bắt buộc";
        if (!formData.address) newErrors.address = "Địa chỉ chi tiết là bắt buộc";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePaymentMethodChange = (method) => {
        setFormData({ ...formData, paymentMethod: method });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const orderRequest = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                district: formData.district,
                address: formData.address,
                note: formData.note,
                paymentMethod: formData.paymentMethod
            };

            const response = await axiosClient.post("/orders/create", orderRequest);
            console.log("Order created:", response.data);

            await syncCartWithBackend();

            alert("Đơn hàng đã được tạo thành công!");
            navigate("/cart");
        } catch (error) {
            console.error("Failed to create order:", error.response?.data || error.message);
            alert("Lỗi khi tạo đơn hàng: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="checkout-page">
            <h1>Thanh toán</h1>
            <div className="checkout-container">
                <div className="checkout-form">
                    <h2>Vui lòng cung cấp thông tin của bạn</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Họ và tên"
                            />
                            {errors.fullName && <span className="error">{errors.fullName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Điện thoại *</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Điện thoại"
                            />
                            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Quận/Huyện *</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map((district, index) => (
                                    <option key={index} value={district}>{district}</option>
                                ))}
                            </select>
                            {errors.district && <span className="error">{errors.district}</span>}
                        </div>
                        <div className="form-group">
                            <label>Số nhà, tên đường, phường/xã *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Địa chỉ chi tiết"
                            />
                            {errors.address && <span className="error">{errors.address}</span>}
                        </div>
                        <div className="form-group">
                            <label>Nguồn nhắn khác (Nếu có)</label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                placeholder="Ghi chú về đơn hàng, ví dụ: giờ giao hàng"
                            />
                        </div>
                    </form>
                </div>
                <div className="order-summary">
                    <h2>Thông tin đơn hàng</h2>
                    <div className="order-items">
                        <p>Các món giao ngay ({cart.length})</p>
                        {cart.map((item) => (
                            <div key={item.id} className="order-item">
                                <img
                                    src={item.image || "https://placehold.co/80x80"}
                                    alt={item.name}
                                    className="order-item-image"
                                />
                                <div className="order-item-details">
                                    <p>{item.name || "Sản phẩm #" + item.productId}</p>
                                    <p>Số lượng: {item.quantity || 1}</p>
                                    <p>Giá: {(item.price || 0).toFixed(0)} đ</p>
                                    <p>Tổng: {((item.price || 0) * (item.quantity || 1)).toFixed(0)} đ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="order-total">
                        <span>Tổng đơn:</span>
                        <span>{calculateTotal()} đ</span>
                    </div>
                    <div className="order-total">
                        <span>Phí vận chuyển:</span>
                        <span>0 đ</span>
                    </div>
                    <div className="order-total">
                        <span>Bạn được giảm:</span>
                        <span>0 đ</span>
                    </div>
                    <div className="order-total final">
                        <span>Tổng tiền thanh toán:</span>
                        <span>{calculateTotal()} đ</span>
                    </div>
                    <div className="payment-methods">
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={formData.paymentMethod === "COD"}
                                onChange={() => handlePaymentMethodChange("COD")}
                            />
                            Thanh toán khi nhận hàng
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="BANK"
                                checked={formData.paymentMethod === "BANK"}
                                onChange={() => handlePaymentMethodChange("BANK")}
                            />
                            Chuyển khoản qua ngân hàng
                        </label>
                    </div>
                    <button className="confirm-btn" onClick={handleSubmit}>Thanh toán</button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;