import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { isLoggedIn, userName, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        window.location.href = "/login";
    };

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
                <li className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</li>
            </ul>

            {menuOpen && (
                <div className="dropdown-menu" ref={dropdownRef}>
                    {isLoggedIn ? (
                        <>
                            <p>👤 {userName}</p>
                            <Link to="/orders" onClick={() => setMenuOpen(false)}>Tài khoản</Link>
                            <button onClick={handleLogout}>Đăng xuất</button>
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