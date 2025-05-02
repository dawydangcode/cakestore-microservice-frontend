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
                        <li><Link to="/admin/orders">Quản lý đơn hàng</Link></li>
                        <li><Link to="/admin/categories">Quản lý danh mục</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;