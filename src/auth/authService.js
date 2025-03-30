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

        console.log("Login success:", { token, roles: roleList, userName });

        // Tải giỏ hàng sau khi đăng nhập
        const cartItems = await fetchCartItems();
        return { token, roles: roleList, cartItems };
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

// Hàm lấy giỏ hàng từ back-end
export const fetchCartItems = async () => {
    try {
        const response = await axiosClient.get("/carts/getCartItems");
        console.log("Cart items fetched:", response.data);
        return response.data; // Danh sách CartItem từ back-end
    } catch (error) {
        console.error("Failed to fetch cart items:", error.response?.data || error.message);
        return [];
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