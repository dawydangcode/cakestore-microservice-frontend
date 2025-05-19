import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axiosClient from "../api/axiosClient";
import "./CartPage.css";

const CartPage = () => {
    const { cart, removeFromCart, increaseQuantity, decreaseQuantity, message, setMessage, syncCartWithBackend } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        syncCartWithBackend();
    }, [syncCartWithBackend]);

    const formatPrice = (price) => {
        return price.toLocaleString("vi-VN");
    };

    const calculateTotal = () => {
        const total = cart.reduce((total, item) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return total + price * quantity;
        }, 0);
        return formatPrice(total);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setMessage({
                type: "error",
                text: "Giỏ hàng của bạn đang trống!"
            });
            return;
        }

        // Kiểm tra trạng thái sản phẩm trước khi thanh toán
        try {
            const invalidItems = [];
            for (const item of cart) {
                const response = await axiosClient.get(`/products/${item.productId}`);
                const product = response.data;
                if (product.status !== "ACTIVE") {
                    invalidItems.push(item.name);
                } else if (product.stock < item.quantity) {
                    invalidItems.push(`${item.name} (hết hàng hoặc số lượng vượt quá tồn kho)`);
                }
            }
            if (invalidItems.length > 0) {
                setMessage({
                    type: "error",
                    text: `Không thể thanh toán. Các sản phẩm sau không hợp lệ: ${invalidItems.join(", ")}.`
                });
                await syncCartWithBackend();
                return;
            }
            navigate("/checkout");
        } catch (error) {
            setMessage({
                type: "error",
                text: "Lỗi khi kiểm tra giỏ hàng: " + (error.response?.data || error.message)
            });
        }
    };

    return (
        <div className="cart-page">
            {message.text && (
                <div className={`message message-${message.type}`}>
                    {message.text}
                    <button
                        className="close-message"
                        onClick={() => setMessage({ type: "", text: "" })}
                    >×</button>
                </div>
            )}
            {cart.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Tổng</th>
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <img
                                            src={item.image || "https://placehold.co/80x80"}
                                            alt={item.name || "Sản phẩm #" + item.productId}
                                            className="cart-item-image"
                                        />
                                    </td>
                                    <td>{item.name || "Sản phẩm #" + item.productId}</td>
                                    <td>{formatPrice(item.price || 0)} VND</td>
                                    <td>
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => decreaseQuantity(item.cartId, item.productId)}
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <span>{item.quantity || 1}</span>
                                            <button
                                                onClick={() => increaseQuantity(item.cartId, item.productId)}
                                            >+</button>
                                        </div>
                                    </td>
                                    <td>{formatPrice((item.price || 0) * (item.quantity || 1))} VND</td>
                                    <td>
                                        <button
                                            onClick={() => removeFromCart(item.cartId, item.productId)}
                                            className="remove-btn"
                                        >Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-total">
                        <h3>Tổng giá: {calculateTotal()} đ</h3>
                        <button className="checkout-btn" onClick={handleCheckout}>Thanh Toán</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;