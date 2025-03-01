import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
// import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const { cart } = useContext(CartContext);
    // const { user, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

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
                {/* {menuOpen && (
                    <div className="dropdown-menu">
                        {user ? (
                            <>
                                <p>👤 {user.username}</p>
                                <button onClick={logout}>Đăng xuất</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin">Đăng nhập</Link>
                                <Link to="/signup">Đăng ký</Link>
                            </>
                        )}
                    </div>
                )} */}
            </ul>
        </nav>
    );
};

export default Navbar;
