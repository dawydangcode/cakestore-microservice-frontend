import { logout } from "../auth/authService";

const LogoutButton = () => {
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return <button onClick={handleLogout}>Đăng xuất</button>;
};

export default LogoutButton;
