import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const CartPage = () => {
    const { cart, removeFromCart } = useContext(CartContext);

    return (
        <div>
            <h1>Your Shopping Cart 🛍️</h1>
            {cart.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <ul>
                    {cart.map((item) => (
                        <li key={item.productId}>
                            {item.name} - {item.price} VND x {item.quantity}
                            <button onClick={() => removeFromCart(item.productId)}>Xoá</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CartPage;