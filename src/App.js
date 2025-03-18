import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { getToken } from "./auth/auth"; // Import hàm lấy token từ localStorage
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import Cart from "./pages/CartPage";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton"; // Import nút đăng xuất
import "./App.css";

const PrivateRoute = ({ element }) => {
    return getToken() ? element : <Navigate to="/login" replace />;
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
                        </Routes>
                    </main>
                    {getToken() && <LogoutButton />} {/* Hiển thị nút đăng xuất nếu đã đăng nhập */}
                </div>
            </Router>
        </CartProvider>
    );
}

export default App;
