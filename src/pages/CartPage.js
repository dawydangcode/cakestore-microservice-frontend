import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
    const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            return total + price * quantity;
        }, 0).toFixed(2);
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }
        navigate("/checkout");
    };

    return (
        <div className="cart-page">
            <h1>Your Shopping Cart 🛍️</h1>
            {cart.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
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
                                    <td>{item.name || "Sản phẩm #" + item.productId}</td>
                                    <td>{(item.price || 0).toFixed(2)} VND</td>
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
                                    <td>{((item.price || 0) * (item.quantity || 1)).toFixed(2)} VND</td>
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
                        <h3>Tổng giá: {calculateTotal()} VND</h3>
                        <button className="checkout-btn" onClick={handleCheckout}>Thanh Toán</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;