import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
// import Footer from "./components/layout/Footer";
import Home from "./pages/home/Home";
import ProductList from "./components/products/ProductList";
import Cart from "./pages/CartPage";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        {/* Khi vào "/", sẽ hiển thị Home.js */}
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </main>
                {/* <Footer /> */}
            </div>
        </Router>
    );
}

export default App;
