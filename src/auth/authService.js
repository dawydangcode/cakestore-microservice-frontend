import axiosClient from "../api/axiosClient";

export const login = async (username, password) => {
    try {
        const response = await axiosClient.post("/sign-in", { userName: username, password });
        const { token, roles } = response.data.response;

        // Trích xuất mảng chuỗi từ roles
        const roleList = roles.map(role => role.authority);

        // Lưu token và roles vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("roles", JSON.stringify(roleList));

        return { token, roles: roleList };
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
};

export const getRoles = () => {
    const roles = localStorage.getItem("roles");
    return roles ? JSON.parse(roles) : null;
};

export const hasRole = (role) => {
    const roles = getRoles();
    return roles && roles.includes(role);
};