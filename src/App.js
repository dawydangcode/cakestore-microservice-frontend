import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { getToken } from "./auth/auth"; // Import hàm lấy token từ localStorage
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import Cart from "./pages/CartPage";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";
import Admin from "./components/Admin"; // Import trang Admin
import { hasRole } from "./auth/authService"; // Import hàm kiểm tra role
import "./App.css";

// Component bảo vệ route dựa trên token và role
const PrivateRoute = ({ element, allowedRole }) => {
    const token = getToken();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRole && !hasRole(allowedRole)) {
        return <Navigate to="/" replace />;
    }
    return element;
};

function App() {
    return (
        <CartProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/products" element={<ProductList />} />
                            <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/admin"
                                element={<PrivateRoute element={<Admin />} allowedRole="ROLE_ADMIN" />}
                            />
                        </Routes>
                    </main>
                    {getToken() && <LogoutButton />}
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;