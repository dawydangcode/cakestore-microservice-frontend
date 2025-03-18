import axios from "axios";
import { getToken } from "../auth/auth"; // Đảm bảo import đúng

const axiosClient = axios.create({
    baseURL: "http://localhost:8080", // Địa chỉ của API Gateway
    headers: {
        "Content-Type": "application/json",
    },
});

// Sử dụng axiosClient thay vì api
axiosClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;
