import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import ProductDetail from "./components/products/ProductDetail";
import Cart from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./components/Login";
import Admin from "./components/admin/Admin";
import AdminOrders from "./components/admin/AdminOrders";
import AdminCategories from "./components/admin/AdminCategories";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import ChatWidget from './components/chat/ChatWidget';
import { hasRole } from "./auth/authService";
import OrderList from "./components/orders/OrderList";
import OrderDetail from "./components/orders/OrderDetail";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import SearchPage from "./pages/SearchPage";
import AdminChat from './components/admin/AdminChat';
import "./App.css";

const PrivateRoute = ({ element, allowedRole }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRole && !hasRole(allowedRole)) return <Navigate to="/" replace />;
    return element;
};

const AppContent = () => {
    const { isLoggedIn, roles } = useAuth();
    const [showChatWidget, setShowChatWidget] = useState(false);

    return (
        <CartProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<><Navbar /><Home /></>} />
                        <Route path="/products" element={<><Navbar /><ProductList /></>} />
                        <Route path="/products/category/:categoryId" element={<><Navbar /><ProductList /></>} />
                        <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
                        <Route path="/cart" element={<PrivateRoute element={<><Navbar /><Cart /></>} />} />
                        <Route path="/checkout" element={<PrivateRoute element={<><Navbar /><Checkout /></>} />} />
                        <Route path="/login" element={<><Navbar /><Login /></>} />
                        <Route path="/signup" element={<><Navbar /><SignUp /></>} />
                        <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
                        <Route path="/orders" element={<PrivateRoute element={<><Navbar /><OrderList /></>} />} />
                        <Route path="/order/:orderId" element={<PrivateRoute element={<><Navbar /><OrderDetail /></>} />} />
                        <Route path="/search" element={<><Navbar /><SearchPage /></>} />
                        <Route path="/admin/*" element={<PrivateRoute element={<AdminLayout />} allowedRole="ROLE_ADMIN" />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<Admin />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="chat" element={<AdminChat />} />
                        </Route>
                    </Routes>
                    {isLoggedIn && !roles.includes('ROLE_ADMIN') && (
                        <>
                            {!showChatWidget && (
                                <button
                                    className="chat-toggle-btn"
                                    onClick={() => setShowChatWidget(true)}
                                >
                                    💬
                                </button>
                            )}
                            {showChatWidget && <ChatWidget onClose={() => setShowChatWidget(false)} />}
                        </>
                    )}
                </div>
            </Router>
        </CartProvider>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;