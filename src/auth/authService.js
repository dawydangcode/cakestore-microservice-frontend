import axiosClient from "../api/axiosClient";

export const login = async (username, password) => {
    try {
        const response = await axiosClient.post("/sign-in", { userName: username, password });
        const { token, roles, username: userName } = response.data.response;

        const roleList = roles.map(role => role.authority);

        // Lưu dữ liệu vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("roles", JSON.stringify(roleList));
        localStorage.setItem("userName", userName);

        // Debug để kiểm tra
        console.log("Login success:", { token, roles: roleList, userName });

        return { token, roles: roleList };
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("userName");
};

export const getToken = () => localStorage.getItem("token");

export const getRoles = () => {
    const roles = localStorage.getItem("roles");
    return roles ? JSON.parse(roles) : null;
};

export const hasRole = (role) => {
    const roles = getRoles();
    return roles && roles.includes(role);
};

export const getUserName = () => {
    return localStorage.getItem("userName") || "Người dùng";
};