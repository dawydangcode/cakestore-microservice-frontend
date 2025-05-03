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
                                    <td>{(item.price || 0).toLocaleString()} VND</td>
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
                                    <td>{((item.price || 0) * (item.quantity || 1)).toLocaleString()} VND</td>
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