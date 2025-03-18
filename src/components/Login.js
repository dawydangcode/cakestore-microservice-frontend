import { useState } from "react";
import { login } from "../auth/authService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const result = await login(username, password);
    setMessage(result.message);
    if (result.success) {
      window.location.href = "/";
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <input type="text" placeholder="Tên đăng nhập" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Đăng nhập</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
