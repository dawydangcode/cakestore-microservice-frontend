import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
    const { cart } = useContext(CartContext);
    const { isLoggedIn, userName, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Fetch search results when searchQuery changes
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery.trim()) {
                try {
                    const response = await axios.get(`http://localhost:8080/products/search?keyword=${searchQuery}`);
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
            }
        };
        fetchSearchResults();
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
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

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (searchResults.length > 0) {
                window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
            }
        }
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
                <li>
                    <button onClick={() => setSearchOpen(true)}>🔍</button>
                </li>
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

            {searchOpen && (
                <div className="search-overlay" ref={searchRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearch}
                        placeholder="Tìm kiếm sản phẩm..."
                        autoFocus
                    />
                    <button onClick={handleSearch}>Xem tất cả ({searchResults.length})</button>
                    {searchResults.length > 0 && (
                        <div className="search-results-underbar">
                            {searchResults.map((product) => (
                                <div key={product.id} className="search-result-item">
                                    <img src={product.image} alt={product.name} className="search-result-image" />
                                    <div className="search-result-details">
                                        <Link to={`/product/${product.id}`} onClick={() => setSearchOpen(false)}>
                                            {product.name}
                                        </Link>
                                        <span className="search-result-price">{product.price} đ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;