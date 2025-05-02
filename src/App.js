import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import ProductDetail from "./components/products/ProductDetail";
import Cart from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";
import Admin from "./components/admin/Admin";
import AdminLayout from "./components/admin/AdminLayout";
import { hasRole } from "./auth/authService";
import OrderList from "./components/orders/OrderList";
import OrderDetail from "./components/orders/OrderDetail";
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
                        <Routes>
                            <Route path="/" element={<><Navbar /><Home /></>} />
                            <Route path="/products" element={<><Navbar /><ProductList /></>} />
                            <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
                            <Route path="/cart" element={<PrivateRoute element={<><Navbar /><Cart /></>} />} />
                            <Route path="/checkout" element={<PrivateRoute element={<><Navbar /><Checkout /></>} />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/orders" element={<PrivateRoute element={<><Navbar /><OrderList /></>} />} />
                            <Route path="/order/:orderId" element={<PrivateRoute element={<><Navbar /><OrderDetail /></>} />} />
                            <Route path="/admin/*" element={<PrivateRoute element={<AdminLayout />} allowedRole="ROLE_ADMIN" />}>
                                <Route path="products" element={<Admin />} />
                            </Route>
                        </Routes>
                        {localStorage.getItem("token") && <LogoutButton />}
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;