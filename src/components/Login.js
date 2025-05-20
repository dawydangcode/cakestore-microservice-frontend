import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { login } from "../auth/authService";
import "./Login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const { login: setAuth } = useContext(AuthContext);
    const { syncCartWithBackend } = useContext(CartContext);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!username) newErrors.username = "Tên đăng nhập là bắt buộc";
        if (!password) newErrors.password = "Mật khẩu là bắt buộc";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validateForm()) return;

        try {
            const { token, roles, cartItems } = await login(username, password);
            setAuth(token, username, roles); // Truyền roles
            await syncCartWithBackend();

            if (roles.includes("ROLE_ADMIN")) {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setServerError("Đăng nhập thất bại! Tên đăng nhập hoặc mật khẩu không đúng.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") setUsername(value);
        if (name === "password") setPassword(value);
        setServerError("");
    };

    return (
        <div className="login-page">
            <div className="login-header">
                <h1>Đăng Nhập</h1>
            </div>

            <div className="login-container">
                <div className="login-form">
                    <h2>Thông Tin Đăng Nhập</h2>
                    {serverError && <div className="server-error">{serverError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Tên đăng nhập *</span>
                            </div>
                            {errors.username && <span className="error">{errors.username}</span>}
                        </div>

                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Mật khẩu *</span>
                            </div>
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <button className="login-btn" type="submit">
                            Đăng Nhập
                        </button>
                    </form>
                    <div className="links">
                        <p>Chưa có tài khoản? <a href="/signup">Đăng ký</a></p>
                        <p><a href="/forgot-password">Quên mật khẩu?</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;