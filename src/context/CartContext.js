import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { getToken } from "../auth/auth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const syncCartWithBackend = async () => {
        if (getToken()) {
            try {
                const response = await axiosClient.get("/carts/getCartItems");
                setCart(response.data);
                console.log("Cart synced with backend:", response.data);
            } catch (error) {
                console.error("Failed to sync cart with backend:", error.response?.data || error.message);
                setCart([]);
            }
        }
    };

    useEffect(() => {
        syncCartWithBackend();
    }, []);

    const addToCart = async (product, quantity = 1) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity }];
        });

        if (getToken()) {
            try {
                await axiosClient.post("/carts/addItemToCart", {
                    productId: product.id,
                    quantity,
                    price: product.price
                });
                await syncCartWithBackend();
            } catch (error) {
                console.error("Failed to sync cart with backend:", error.response?.data || error.message);
                setCart((prevCart) => prevCart.filter(item => item.productId !== product.id));
                alert("Lỗi khi thêm vào giỏ hàng: " + error.message);
            }
        }
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.productId !== productId));
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, syncCartWithBackend }}>
            {children}
        </CartContext.Provider>
    );
};