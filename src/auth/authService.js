import axiosClient from "../api/axiosClient";
import { setToken, removeToken } from "../auth/auth";

export const login = async (username, password) => {
  try {
    const response = await axiosClient.post("/signin", { userName: username, password });
    if (response.data.status === "SUCCESS") {
      setToken(response.data.response.token);
      return { success: true, message: "Đăng nhập thành công!" };
    }
  } catch (error) {
    return { success: false, message: "Sai tài khoản hoặc mật khẩu" };
  }
};

export const logout = async () => {
  try {
    await axiosClient.post("/logout");
  } catch (error) {
    console.error("Logout error", error);
  }
  removeToken();
};
