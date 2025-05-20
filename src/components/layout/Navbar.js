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
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    // Theo dõi cuộn trang
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch kết quả tìm kiếm khi searchQuery thay đổi
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

        // Thêm debounce để tránh gọi API quá nhiều
        const timeoutId = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Xử lý click ra ngoài dropdown và search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus vào ô tìm kiếm khi mở
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        window.location.href = "/login";
    };

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (searchQuery.trim()) {
                window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
                setSearchOpen(false);
            }
        }
    };

    // Xử lý phím ESC để đóng search
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setSearchOpen(false);
            }
        };
        
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <h2>🍰 Sweet Shop</h2>
            </Link>
            
            <ul>
                <li className="main-links"><Link to="/">Trang chủ</Link></li>
                <li className="main-links"><Link to="/products">Sản phẩm</Link></li>
                <li>
                    <Link to="/cart" className="cart-link">
                        Giỏ hàng <span className="cart-icon">🛒</span>
                        {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                    </Link>
                </li>
                <li>
                    <button className="search-icon" onClick={() => setSearchOpen(true)}>
                        🔍
                    </button>
                </li>
                <li>
                    <button className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>
                </li>
            </ul>

            {menuOpen && (
                <div className={`dropdown-menu ${menuOpen ? 'active' : ''}`} ref={dropdownRef}>
                    {isLoggedIn ? (
                        <>
                            <p>👤 {userName}</p>
                            <Link to="/orders" onClick={() => setMenuOpen(false)}>Tài khoản của tôi</Link>
                            <Link to="/orders" onClick={() => setMenuOpen(false)}>Đơn hàng của tôi</Link>
                            <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Danh sách yêu thích</Link>
                            <button onClick={handleLogout}>Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
                        </>
                    )}
                </div>
            )}

            <div className={`search-overlay ${searchOpen ? 'active' : ''}`}>
                <div className="search-container">
                    <div className="search-header">
                        <input
                            type="text"
                            ref={searchInputRef}
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearch}
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                        <button 
                            className="search-button"
                            onClick={handleSearch}
                            disabled={!searchQuery.trim()}
                        >
                            Tìm <span>({searchResults.length})</span>
                        </button>
                        <button 
                            className="search-close"
                            onClick={() => setSearchOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="search-results-wrapper">
                        {searchQuery.trim() && (
                            searchResults.length > 0 ? (
                                <div className="search-results-underbar">
                                    {searchResults.map((product) => (
                                        <div key={product.id} className="search-result-item">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="search-result-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60?text=Bánh';
                                                }}
                                            />
                                            <div className="search-result-details">
                                                <Link 
                                                    to={`/product/${product.id}`} 
                                                    onClick={() => setSearchOpen(false)}
                                                >
                                                    {product.name}
                                                </Link>
                                                <span className="search-result-price">
                                                    {new Intl.NumberFormat('vi-VN', { 
                                                        style: 'currency', 
                                                        currency: 'VND' 
                                                    }).format(product.price)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="search-results-empty">
                                    Không tìm thấy sản phẩm phù hợp
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;