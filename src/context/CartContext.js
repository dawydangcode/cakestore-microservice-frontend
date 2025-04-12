// src/context/CartContext.js
import React, { createContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { getToken } from "../auth/auth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const fetchProductDetails = async (productId) => {
        try {
            const response = await axiosClient.get(`http://localhost:8080/products/${productId}`);
            return response.data; // Trả về toàn bộ sản phẩm, bao gồm name, price, v.v.
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error.response?.data || error.message);
            return null;
        }
    };

    const syncCartWithBackend = async () => {
        if (getToken()) {
            try {
                const response = await axiosClient.get("/carts/getCartItems");
                const cartItems = response.data;

                // Lấy thông tin sản phẩm cho từng item
                const updatedCart = await Promise.all(
                    cartItems.map(async (item) => {
                        const product = await fetchProductDetails(item.productId);
                        return {
                            ...item,
                            name: product ? product.name : `Sản phẩm #${item.productId}`,
                            price: product ? product.price : item.price // Dùng price từ product-service nếu có
                        };
                    })
                );

                setCart(updatedCart);
                console.log("Cart synced with backend:", updatedCart);
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
                console.error("Failed to add to cart:", error.response?.data || error.message);
                setCart((prevCart) => prevCart.filter(item => item.productId !== product.id));
                alert("Lỗi khi thêm vào giỏ hàng: " + error.message);
            }
        }
    };

    const removeFromCart = async (cartId, productId) => {
        try {
            await axiosClient.delete(`/carts/cart/${cartId}/item/${productId}`);
            await syncCartWithBackend();
        } catch (error) {
            console.error("Failed to remove from cart:", error.response?.data || error.message);
            alert("Lỗi khi xóa sản phẩm: " + error.message);
        }
    };

    const increaseQuantity = async (cartId, productId) => {
        try {
            await axiosClient.put(`/carts/cart/${cartId}/item/${productId}/increase`);
            await syncCartWithBackend();
        } catch (error) {
            console.error("Failed to increase quantity:", error.response?.data || error.message);
            alert("Lỗi khi tăng số lượng: " + error.message);
        }
    };

    const decreaseQuantity = async (cartId, productId) => {
        try {
            await axiosClient.put(`/carts/cart/${cartId}/item/${productId}/decrease`);
            await syncCartWithBackend();
        } catch (error) {
            console.error("Failed to decrease quantity:", error.response?.data || error.message);
            alert("Lỗi khi giảm số lượng: " + error.message);
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, syncCartWithBackend }}>
            {children}
        </CartContext.Provider>
    );
};