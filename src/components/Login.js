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
            const { token, roles, cartItems } = await login(username, password);
            setAuth(token, localStorage.getItem("userName"));
            await syncCartWithBackend();

            if (roles.includes("ROLE_ADMIN")) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (error) {
            alert("Đăng nhập thất bại!");
        }
    };

    // Nội bộ CSS style object
    const styles = {
        form: {
            maxWidth: "360px",
            margin: "100px auto",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            fontFamily: "Arial, sans-serif",
        },
        title: {
            textAlign: "center",
            color: "#333",
            marginBottom: "12px",
        },
        input: {
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
        },
        button: {
            padding: "12px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
        }
    };

    return (
       
        <form style={styles.form} onSubmit={handleSubmit}>
            <h2 style={styles.title}>Đăng nhập</h2>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                required
                style={styles.input}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                required
                style={styles.input}
            />
            <button
                type="submit"
                style={styles.button}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
            >
                Đăng nhập
            </button>
        </form>
    );
};

export default Login;
