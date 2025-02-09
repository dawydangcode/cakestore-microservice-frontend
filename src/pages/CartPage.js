import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const CartPage = () => {
    const { cart } = useContext(CartContext);

    return (
        <div>
            <h1>Your Shopping Cart 🛍️</h1>
            {cart.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <ul>
                    {cart.map((product) => (
                        <li key={product.id}>
                            {product.name} - {product.price} VND x {product.quantity}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CartPage;
