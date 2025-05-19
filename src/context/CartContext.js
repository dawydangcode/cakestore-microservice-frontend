import React, { createContext, useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { getToken } from "../auth/auth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchProductDetails = async (productId) => {
        try {
            const response = await axiosClient.get(`/products/${productId}`);
            console.log(`Fetched product ${productId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error.response?.data || error.message);
            return null;
        }
    };

    const syncCartWithBackend = useCallback(async () => {
        if (getToken()) {
            try {
                console.log("Syncing cart with backend...");
                const response = await axiosClient.get("/carts/getCartItems");
                const cartItems = response.data;

                const updatedCart = await Promise.all(
                    cartItems.map(async (item) => {
                        const product = await fetchProductDetails(item.productId);
                        if (product && product.status === "ACTIVE") {
                            return {
                                ...item,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                status: product.status,
                                stock: product.stock
                            };
                        }
                        return null;
                    })
                );

                const validCart = updatedCart.filter(item => item !== null);
                const removedItems = updatedCart.filter(item => item === null);
                if (removedItems.length > 0) {
                    setMessage({
                        type: "warning",
                        text: "Một số sản phẩm đã bị ẩn hoặc không tồn tại và đã được xóa khỏi giỏ hàng."
                    });
                }
                setCart(validCart);
                console.log("Cart synced with backend:", validCart);
            } catch (error) {
                console.error("Failed to sync cart with backend:", error.response?.data || error.message);
                setMessage({
                    type: "error",
                    text: "Lỗi khi đồng bộ giỏ hàng: " + (error.response?.data || error.message)
                });
                setCart([]);
            }
        }
    }, []);

    const addToCart = async (product, quantity = 1) => {
        try {
            // Kiểm tra trạng thái và tồn kho sản phẩm
            const productDetails = await fetchProductDetails(product.id);
            if (!productDetails) {
                setMessage({
                    type: "error",
                    text: `Sản phẩm "${product.name}" không tồn tại.`
                });
                return;
            }
            if (productDetails.status !== "ACTIVE") {
                setMessage({
                    type: "error",
                    text: `Sản phẩm "${product.name}" đã bị ẩn và không thể thêm vào giỏ hàng.`
                });
                return;
            }
            if (productDetails.stock <= 0) {
                setMessage({
                    type: "error",
                    text: `Sản phẩm "${product.name}" đã hết hàng.`
                });
                return;
            }
            if (productDetails.stock < quantity) {
                setMessage({
                    type: "error",
                    text: `Số lượng yêu cầu vượt quá tồn kho của "${product.name}".`
                });
                return;
            }

            setCart((prevCart) => {
                const existingItem = prevCart.find(item => item.productId === product.id);
                if (existingItem) {
                    return prevCart.map(item =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prevCart, {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity,
                    status: productDetails.status,
                    stock: productDetails.stock
                }];
            });

            if (getToken()) {
                await axiosClient.post("/carts/addItemToCart", {
                    productId: product.id,
                    quantity,
                    price: product.price
                });
                await syncCartWithBackend();
                setMessage({
                    type: "success",
                    text: `Đã thêm "${product.name}" vào giỏ hàng!`
                });
            }
        } catch (error) {
            console.error("Failed to add to cart:", error.response?.data || error.message);
            setCart((prevCart) => prevCart.filter(item => item.productId !== product.id));
            setMessage({
                type: "error",
                text: "Lỗi khi thêm vào giỏ hàng: " + (error.response?.data || error.message)
            });
        }
    };

    const removeFromCart = async (cartId, productId) => {
        try {
            await axiosClient.delete(`/carts/cart/${cartId}/item/${productId}`);
            await syncCartWithBackend();
            setMessage({
                type: "success",
                text: "Đã xóa sản phẩm khỏi giỏ hàng."
            });
        } catch (error) {
            console.error("Failed to remove from cart:", error.response?.data || error.message);
            setMessage({
                type: "error",
                text: "Lỗi khi xóa sản phẩm: " + (error.response?.data || error.message)
            });
        }
    };

    const increaseQuantity = async (cartId, productId) => {
        try {
            await axiosClient.put(`/carts/cart/${cartId}/item/${productId}/increase`);
            await syncCartWithBackend();
        } catch (error) {
            console.error("Failed to increase quantity:", error.response?.data || error.message);
            setMessage({
                type: "error",
                text: "Lỗi khi tăng số lượng: " + (error.response?.data || error.message)
            });
        }
    };

    const decreaseQuantity = async (cartId, productId) => {
        try {
            await axiosClient.put(`/carts/cart/${cartId}/item/${productId}/decrease`);
            await syncCartWithBackend();
        } catch (error) {
            console.error("Failed to decrease quantity:", error.response?.data || error.message);
            setMessage({
                type: "error",
                text: "Lỗi khi giảm số lượng: " + (error.response?.data || error.message)
            });
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            increaseQuantity,
            decreaseQuantity,
            syncCartWithBackend,
            message,
            setMessage
        }}>
            {children}
        </CartContext.Provider>
    );
};