// src/components/admin/AdminLayout.js
import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <ul>
                        <li><Link to="/admin/products">Quản lý sản phẩm</Link></li>
                        {/* Thêm các menu khác sau này: users, orders, etc */}
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet /> {/* Nội dung các trang con sẽ hiển thị ở đây */}
            </main>
        </div>
    );
};

export default AdminLayout;