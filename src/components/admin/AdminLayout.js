import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [newMessageUsers, setNewMessageUsers] = useState(new Set()); // Thêm trạng thái mới

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Quản lý sản phẩm", icon: "📦" },
    { path: "/admin/orders", label: "Quản lý đơn hàng", icon: "🛒" },
    { path: "/admin/categories", label: "Quản lý danh mục", icon: "📑" },
    { path: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
    { path: "/admin/chat", label: "Chat Hỗ trợ", icon: "💬" },
  ];

  useEffect(() => {
    const socket = new SockJS('http://localhost:8081/ws/chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: (str) => console.log(str)
    });

    client.onConnect = () => {
      console.log('WebSocket connected for AdminLayout');
      client.subscribe('/topic/chat', (message) => {
        console.log('Received message in AdminLayout:', message.body);
        const receivedMessage = JSON.parse(message.body);
        if (receivedMessage.senderType !== 'SUPPORT' && location.pathname !== '/admin/chat') {
          setHasNewMessages(true);
          // Thêm người dùng có tin nhắn mới vào newMessageUsers
          setNewMessageUsers(prev => new Set([...prev, receivedMessage.userName]));
        }
      });
    };

    client.onStompError = (error) => {
      console.error('WebSocket connection error:', error);
    };

    client.activate();

    return () => {
      if (client) client.deactivate();
    };
  }, [location.pathname]);

  // Reset new message state when navigating to /admin/chat
  useEffect(() => {
    if (location.pathname === '/admin/chat') {
      setHasNewMessages(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("Logging out admin...");
    logout();
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

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
                  className={`${location.pathname === item.path ? "active" : ""} ${item.path === "/admin/chat" && hasNewMessages ? "blink" : ""}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button 
                onClick={handleLogout}
                className="logout-btn"
              >
                <span className="menu-icon">🚪</span>
                Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet context={{ newMessageUsers }} /> {/* Truyền newMessageUsers qua Outlet */}
      </main>
    </div>
  );
};

export default AdminLayout;