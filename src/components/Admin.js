import React from "react";

const Admin = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the Admin page! Only users with ROLE_ADMIN can access this page.</p>
            {/* Thêm nội dung admin, ví dụ: quản lý người dùng, sản phẩm, đơn hàng */}
        </div>
    );
};

export default Admin;