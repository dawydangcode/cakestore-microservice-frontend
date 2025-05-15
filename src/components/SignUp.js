import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./SignUp.css";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        fullName: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const validateForm = () => {
        const newErrors = {};
        if (!formData.userName) newErrors.userName = "Tên đăng nhập là bắt buộc";
        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }
        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (!formData.fullName) newErrors.fullName = "Họ và tên là bắt buộc";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validateForm()) return;

        try {
            const response = await axiosClient.post("/sign-up", formData);
            console.log("Sign-up successful:", response.data);
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/sign-in");
        } catch (error) {
            console.error("Sign-up failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Lỗi khi đăng ký";
            setServerError(errorMessage);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-header">
                <h1>Đăng Ký</h1>
            </div>

            <div className="signup-container">
                <div className="signup-form">
                    <h2>Thông Tin Đăng Ký</h2>
                    {serverError && <div className="server-error">{serverError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Tên đăng nhập *</span>
                            </div>
                            {errors.userName && <span className="error">{errors.userName}</span>}
                        </div>

                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Email *</span>
                            </div>
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Mật khẩu *</span>
                            </div>
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <div className="floating-label-input">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                    required
                                />
                                <span className="floating-label">Họ và tên *</span>
                            </div>
                            {errors.fullName && <span className="error">{errors.fullName}</span>}
                        </div>

                        <button className="signup-btn" type="submit">
                            Đăng Ký
                        </button>
                    </form>
                    <div className="links">
                        <p>Đã có tài khoản? <a href="/sign-in">Đăng nhập</a></p>
                        <p><a href="/forgot-password">Quên mật khẩu?</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;