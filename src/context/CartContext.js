import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Xoá sản phẩm khỏi giỏ hàng
    const removeFromCart = (productId) => {
        setCart((prevCart) => {
            return prevCart
                .map((item) => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
                .filter((item) => item.quantity > 0); // Xoá nếu số lượng = 0
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};
