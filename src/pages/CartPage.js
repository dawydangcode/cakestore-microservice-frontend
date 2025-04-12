// src/pages/CartPage.js
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
    const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
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
                                <tr key={item.productId}>
                                    <td>{item.name || "Sản phẩm #" + item.productId}</td>
                                    <td>{item.price} VND</td>
                                    <td>
                                        <button 
                                            onClick={() => decreaseQuantity(item.cartId, item.productId)}
                                            disabled={item.quantity <= 1}
                                        >-</button>
                                        {item.quantity}
                                        <button onClick={() => increaseQuantity(item.cartId, item.productId)}>+</button>
                                    </td>
                                    <td>{(item.price * item.quantity).toFixed(2)} VND</td>
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
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;