import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080", // Địa chỉ của API Gateway
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosClient;
