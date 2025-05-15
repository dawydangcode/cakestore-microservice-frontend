import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã và mật khẩu mới
    const [formData, setFormData] = useState({
        email: "",
        token: "",
        newPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const validateEmailForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateResetForm = () => {
        const newErrors = {};
        if (!formData.token) newErrors.token = "Mã xác nhận là bắt buộc";
        if (!formData.newPassword) {
            newErrors.newPassword = "Mật khẩu mới là bắt buộc";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setServerError("");
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validateEmailForm()) return;

        try {
            const response = await axiosClient.post("/forgot-password", { email: formData.email });
            console.log("Forgot password request successful:", response.data);
            setStep(2);
        } catch (error) {
            console.error("Forgot password request failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Lỗi khi gửi mã xác nhận";
            setServerError(errorMessage);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validateResetForm()) return;

        try {
            const response = await axiosClient.post("/reset-password", {
                token: formData.token,
                newPassword: formData.newPassword,
            });
            console.log("Password reset successful:", response.data);
            alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
            navigate("/login");
        } catch (error) {
            console.error("Password reset failed:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || "Lỗi khi đặt lại mật khẩu";
            setServerError(errorMessage);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-header">
                <h1>Quên Mật Khẩu</h1>
            </div>

            <div className="forgot-password-container">
                <div className="forgot-password-form">
                    <h2>{step === 1 ? "Gửi Mã Xác Nhận" : "Đặt Lại Mật Khẩu"}</h2>
                    {serverError && <div className="server-error">{serverError}</div>}
                    {step === 1 ? (
                        <form onSubmit={handleEmailSubmit}>
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
                            <button className="submit-btn" type="submit">
                                Gửi Mã Xác Nhận
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetSubmit}>
                            <div className="form-group">
                                <div className="floating-label-input">
                                    <input
                                        type="text"
                                        name="token"
                                        value={formData.token}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                        required
                                    />
                                    <span className="floating-label">Mã xác nhận *</span>
                                </div>
                                {errors.token && <span className="error">{errors.token}</span>}
                            </div>
                            <div className="form-group">
                                <div className="floating-label-input">
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                        required
                                    />
                                    <span className="floating-label">Mật khẩu mới *</span>
                                </div>
                                {errors.newPassword && <span className="error">{errors.newPassword}</span>}
                            </div>
                            <button className="submit-btn" type="submit">
                                Đặt Lại Mật Khẩu
                            </button>
                        </form>
                    )}
                    <div className="links">
                        <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
                        <p>Chưa có tài khoản? <a href="/signup">Đăng ký</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;