import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
// import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import Cart from "./pages/CartPage";
// import Signup from "./pages/SignUp";
// import Signin from "./pages/SignIn";
import "./App.css";

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
                                <Route path="/cart" element={<Cart />} />
                                {/* <Route path="/signup" element={<Signup />} /> */}
                            </Routes>
                        </main>
                    </div>
                </Router>
            </CartProvider>
    );
}

export default App;
