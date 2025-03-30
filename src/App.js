import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import Cart from "./pages/CartPage";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";
import Admin from "./components/Admin";
import { hasRole } from "./auth/authService";
import "./App.css";

const PrivateRoute = ({ element, allowedRole }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRole && !hasRole(allowedRole)) return <Navigate to="/" replace />;
    return element;
};

function App() {
    return (
        <AuthProvider>
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
                                <Route path="/admin" element={<PrivateRoute element={<Admin />} allowedRole="ROLE_ADMIN" />} />
                            </Routes>
                        </main>
                        {localStorage.getItem("token") && <LogoutButton />}
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;