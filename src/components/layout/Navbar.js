import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { getToken, logout } from "../../auth/auth"; // Giả sử bạn có auth service
import "./Navbar.css";
import {  getUserName } from "../../auth/authService"; // Import getUserName

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null); // Thêm ref để xử lý click ra ngoài
    

    const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(!!getToken());
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);
    // Đóng menu khi nhấp ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <h2>🍰 Sweet Shop</h2>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li>
                    <Link to="/cart">Cart 🛒 
                        {cart.length > 0 && <span className="cart-count">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
                    </Link>
                </li>
                {/* Nút Menu */}
                <li className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</li>
            </ul>

            {/* Dropdown Menu */}
            {menuOpen && (
                <div className="dropdown-menu" ref={dropdownRef}>
                    {isLoggedIn ? (
                        <>
                            <p>👤 {getUserName()}</p> {/* Hiển thị userName */}
                            <button onClick={() => { logout(); setIsLoggedIn(false); window.location.href = "/login"; }}>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/signup">Đăng ký</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
