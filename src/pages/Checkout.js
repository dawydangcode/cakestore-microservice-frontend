import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axiosClient from "../api/axiosClient";
import Swal from "sweetalert2";
import "./Checkout.css";

const districts = [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7",
    "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Quận Bình Tân",
    "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình",
    "Quận Tân Phú", "Quận Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ",
    "Huyện Củ Chi", "Huyện Hóc Môn", "Huyện Nhà Bè"
];

const Checkout = () => {
    const { cart } = useContext(CartContext); // Xóa syncCartWithBackend
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

    const formatPrice = (price) => {
        return price.toLocaleString("vi-VN");
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return total + price * quantity;
        }, 0);
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
        console.log("Validation errors:", newErrors);
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
        console.log("Submitting form with data:", formData);
        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }

        try {
            const startTime = performance.now();
            const orderRequest = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                district: formData.district,
                address: formData.address,
                note: formData.note,
                paymentMethod: formData.paymentMethod
            };
            console.log("Sending order request:", orderRequest);

            const response = await axiosClient.post("/orders/create", orderRequest);
            const endTime = performance.now();
            console.log(`Order created successfully in ${(endTime - startTime) / 1000} seconds:`, response.data);

            // Không gọi syncCartWithBackend vì clearCart đã chạy trong OrderService

            await Swal.fire({
                icon: "success",
                title: "Thành công!",
                text: `Đơn hàng đã được tạo thành công! Mã đơn hàng: ${response.data.id}`,
                confirmButtonText: "Xem đơn hàng",
                showCancelButton: true,
                cancelButtonText: "Về trang chủ"
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log("Navigating to order:", response.data.id);
                    navigate(`/orders/${response.data.id}`);
                } else {
                    console.log("Navigating to home");
                    navigate("/");
                }
            });
        } catch (error) {
            console.error("Failed to create order:", error.message, error.response?.data);
            await Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: `Tạo đơn hàng thất bại: ${error.response?.data?.message || error.message}`,
                confirmButtonText: "OK"
            });
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-header">
                <h1>Thanh Toán Đơn Hàng</h1>
            </div>
            
            <div className="checkout-container">
                <div className="checkout-form">
                    <h2>Thông Tin Giao Hàng</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Họ và tên *</span>
                            </div>
                            {errors.fullName && <span className="error">{errors.fullName}</span>}
                        </div>
                        
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Điện thoại *</span>
                            </div>
                            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
                        </div>
                        
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                />
                                <span className="floating-label">Email</span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <div className="floating-label-input">
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className={formData.district ? "has-value" : ""}
                                    required
                                >
                                    <option value="" disabled>Chọn Quận/Huyện *</option>
                                    {districts.map((district, index) => (
                                        <option key={index} value={district}>{district}</option>
                                    ))}
                                </select>
                                <span className="floating-label">Quận/Huyện *</span>
                            </div>
                            {errors.district && <span className="error">{errors.district}</span>}
                        </div>
                        
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Địa chỉ chi tiết *</span>
                            </div>
                            {errors.address && <span className="error">{errors.address}</span>}
                        </div>

                        <button type="submit" className="confirm-btn">
                            Hoàn tất đơn hàng
                        </button>
                    </form>
                </div>
                
                <div className="order-summary">
                    <h2>Thông Tin Đơn Hàng</h2>
                    <div className="order-items">
                        <p>Sản phẩm ({cart.length})</p>
                        {cart.map((item, index) => (
                            <div key={index} className="order-item">
                                <img
                                    src={item.image || "https://placehold.co/90x90"}
                                    alt={item.name}
                                    className="order-item-image"
                                />
                                <div className="order-item-details">
                                    <p>{item.name || "Sản phẩm #" + item.productId}</p>
                                    <p>Số lượng: {item.quantity || 1}</p>
                                    <p>Giá: {formatPrice(item.price || 0)} đ</p>
                                    <p>Tổng: {formatPrice((item.price || 0) * (item.quantity || 1))} đ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="order-total">
                        <span>Tạm tính:</span>
                        <span>{formatPrice(calculateTotal())} đ</span>
                    </div>
                    
                    <div className="order-total">
                        <span>Phí vận chuyển:</span>
                        <span>0 đ</span>
                    </div>
                    
                    <div className="order-total">
                        <span>Giảm giá:</span>
                        <span>0 đ</span>
                    </div>
                    
                    <div className="order-total final">
                        <span>Tổng thanh toán:</span>
                        <span>{formatPrice(calculateTotal())} đ</span>
                    </div>
                    
                    <div className="payment-methods">
                        <h3>Phương thức thanh toán</h3>
                        
                        <div 
                            className={`payment-option ${formData.paymentMethod === "COD" ? "selected" : ""}`}
                            onClick={() => handlePaymentMethodChange("COD")}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={formData.paymentMethod === "COD"}
                                onChange={() => handlePaymentMethodChange("COD")}
                                id="cod-payment"
                            />
                            <label htmlFor="cod-payment">Thanh toán khi nhận hàng (COD)</label>
                        </div>
                        
                        <div 
                            className={`payment-option ${formData.paymentMethod === "BANK" ? "selected" : ""}`}
                            onClick={() => handlePaymentMethodChange("BANK")}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="BANK"
                                checked={formData.paymentMethod === "BANK"}
                                onChange={() => handlePaymentMethodChange("BANK")}
                                id="bank-payment"
                            />
                            <label htmlFor="bank-payment">Chuyển khoản ngân hàng</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;