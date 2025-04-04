import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { login } from "../auth/authService";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login: setAuth } = useContext(AuthContext);
    const { syncCartWithBackend } = useContext(CartContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { token, roles, cartItems } = await login(username, password); // Lấy roles
            setAuth(token, localStorage.getItem("userName")); // Cập nhật AuthContext
            await syncCartWithBackend(); // Đồng bộ giỏ hàng từ back-end

            // Kiểm tra vai trò và điều hướng
            if (roles.includes("ROLE_ADMIN")) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            alert("Đăng nhập thất bại!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Đăng nhập</button>
        </form>
    );
};

export default Login;