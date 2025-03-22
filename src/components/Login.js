import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth/authService";


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { roles } = await login(username, password);

            // Kiểm tra roles và chuyển hướng
            if (roles.includes("ROLE_ADMIN")) {
                navigate("/admin");
            } else if (roles.includes("ROLE_USER")) {
                navigate("/");
            } else {
                setError("Unknown role");
            }
        } catch (err) {
            setError("Login failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;