import React from "react";
   import { Outlet, Link, useLocation } from "react-router-dom";
   import "./AdminLayout.css";

   const AdminLayout = () => {
       const location = useLocation();
       
       // Menu items with icons
       const menuItems = [
           { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
           { path: "/admin/products", label: "Quản lý sản phẩm", icon: "📦" },
           { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "🛒" },
           { path: "/admin/categories", label: "Quản lý danh mục", icon: "📑" },
           { path: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
           { path: "/admin/chat", label: "Chat Hỗ trợ", icon: "💬" },
       ];

       return (
           <div className="admin-layout">
               <aside className="sidebar">
                   <div className="sidebar-header">
                       <div className="admin-logo">A</div>
                       <h2>Admin Panel</h2>
                   </div>
                   <nav>
                       <ul>
                           {menuItems.map((item) => (
                               <li key={item.path}>
                                   <Link 
                                       to={item.path} 
                                       className={location.pathname === item.path ? "active" : ""}
                                   >
                                       <span className="menu-icon">{item.icon}</span>
                                       {item.label}
                                   </Link>
                               </li>
                           ))}
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