import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Chart from "chart.js/auto";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        month: "",
        year: "",
        category: "",
        productName: "",
    });
    const [barChart, setBarChart] = useState(null);
    const [lineChart, setLineChart] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            updateCharts(filteredOrders, filteredProducts);
        }
    }, [filters, products, orders]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
                axiosClient.get("/products/list", {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }),
                axiosClient.get("/categories"),
                axiosClient.get("/orders/all", {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }),
            ]);
            setProducts(productsResponse.data);
            setCategories(categoriesResponse.data);
            setOrders(ordersResponse.data);
        } catch (error) {
            setMessage({
                type: "error",
                text: "Lỗi khi lấy dữ liệu: " + (error.response?.data || error.message),
            });
        } finally {
            setLoading(false);
        }
    };

    // Lọc dữ liệu
    const filteredProducts = products.filter((product) => {
        const matchesCategory = filters.category
            ? product.categoryId === parseInt(filters.category) ||
              (product.category && product.category.categoryId === parseInt(filters.category))
            : true;
        const matchesName = filters.productName
            ? product.name.toLowerCase().includes(filters.productName.toLowerCase())
            : true;
        return matchesCategory && matchesName;
    });

    const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const matchesDateRange =
            (!filters.startDate || orderDate >= new Date(filters.startDate)) &&
            (!filters.endDate || orderDate <= new Date(filters.endDate));
        const matchesMonth = filters.month
            ? orderDate.getMonth() + 1 === parseInt(filters.month)
            : true;
        const matchesYear = filters.year
            ? orderDate.getFullYear() === parseInt(filters.year)
            : true;
        return matchesDateRange && matchesMonth && matchesYear;
    });

    // Tính toán metrics
    const totalProducts = filteredProducts.length;
    const totalCategories = categories.length;
    const totalOrders = filteredOrders.length;
    const lowStockProducts = filteredProducts.filter((p) => p.stock < 5).length;
    const recentProducts = filteredProducts
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
    const recentOrders = filteredOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Chuẩn bị dữ liệu cho biểu đồ
    const getMonthlyRevenue = (orders) => {
        const monthlyData = Array(12).fill(0);
        orders.forEach((order) => {
            const month = new Date(order.createdAt).getMonth();
            monthlyData[month] += order.totalPrice;
        });
        return monthlyData;
    };

    const getMonthlyLowStock = (products) => {
        const monthlyData = Array(12).fill(0);
        products
            .filter((p) => p.stock < 5)
            .forEach((product) => {
                const createdDate = new Date(product.createdAt || Date.now());
                const month = createdDate.getMonth();
                monthlyData[month] += 1;
            });
        return monthlyData;
    };

    const updateCharts = (orders, products) => {
        const monthlyRevenue = getMonthlyRevenue(orders);
        const monthlyLowStock = getMonthlyLowStock(products);
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        // Cập nhật Bar Chart (Doanh thu theo tháng)
        if (barChart) barChart.destroy();
        const barCtx = document.getElementById("revenueChart").getContext("2d");
        setBarChart(
            new Chart(barCtx, {
                type: "bar",
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: "Doanh thu (VND)",
                            data: monthlyRevenue,
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            })
        );

        // Cập nhật Line Chart (Sản phẩm tồn kho thấp theo tháng)
        if (lineChart) lineChart.destroy();
        const lineCtx = document.getElementById("lowStockChart").getContext("2d");
        setLineChart(
            new Chart(lineCtx, {
                type: "line",
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: "Số sản phẩm tồn kho thấp",
                            data: monthlyLowStock,
                            fill: false,
                            borderColor: "rgba(255, 99, 132, 1)",
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            })
        );
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("vi-VN", options);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Chờ thanh toán":
                return "status-pending";
            case "Đã thanh toán":
                return "status-paid";
            case "Thanh toán thất bại":
                return "status-failed";
            case "Hủy":
                return "status-cancelled";
            default:
                return "";
        }
    };

    return (
        <div className="admin-dashboard-container">
            <div className="admin-header">
                <h1>Dashboard</h1>
            </div>

            {message.text && (
                <div className={`message-alert ${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: "", text: "" })}>
                        ✖
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <>
                    {/* Bộ lọc */}
                    <div className="dashboard-filters">
                        <div className="filter-group">
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Tháng:</label>
                            <select
                                name="month"
                                value={filters.month}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Năm:</label>
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả</option>
                                {Array.from(
                                    { length: 5 },
                                    (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Danh mục:</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                <option value="">Tất cả</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.categoryId}
                                        value={category.categoryId}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Tên sản phẩm:</label>
                            <input
                                type="text"
                                name="productName"
                                value={filters.productName}
                                onChange={handleFilterChange}
                                placeholder="Nhập tên sản phẩm..."
                            />
                        </div>
                    </div>

                    {/* Biểu đồ */}
                    <div className="dashboard-charts">
                        <div className="chart-container">
                            <h2>Doanh thu theo tháng</h2>
                            <canvas id="revenueChart"></canvas>
                        </div>
                        <div className="chart-container">
                            <h2>Sản phẩm tồn kho thấp theo tháng</h2>
                            <canvas id="lowStockChart"></canvas>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="dashboard-metrics">
                        <div className="metric-card">
                            <h3>Tổng sản phẩm</h3>
                            <p>{totalProducts}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Tổng danh mục</h3>
                            <p>{totalCategories}</p>
                        </div>
                        <div className="metric-card">
                            <h3>Tổng đơn hàng</h3>
                            <p>{totalOrders}</p>
                        </div>
                        <div className="metric-card warning">
                            <h3>Tồn kho thấp</h3>
                            <p>{lowStockProducts}</p>
                        </div>
                    </div>

                    {/* Quick Lists */}
                    <div className="dashboard-section">
                        <h2>Sản phẩm tồn kho thấp</h2>
                        {filteredProducts.filter((p) => p.stock < 5).length > 0 ? (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Tên sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th>Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts
                                        .filter((p) => p.stock < 5)
                                        .slice(0, 5)
                                        .map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>
                                                    {product.category
                                                        ? product.category.name
                                                        : categories.find(
                                                              (cat) =>
                                                                  cat.categoryId ===
                                                                  product.categoryId
                                                          )?.name || "Không xác định"}
                                                </td>
                                                <td>{product.stock}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Không có sản phẩm nào tồn kho thấp.</p>
                        )}
                    </div>

                    <div className="dashboard-section">
                        <h2>Sản phẩm mới thêm</h2>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Danh mục</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>
                                            {product.category
                                                ? product.category.name
                                                : categories.find(
                                                      (cat) =>
                                                          cat.categoryId ===
                                                          product.categoryId
                                                  )?.name || "Không xác định"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="dashboard-section">
                        <h2>Đơn hàng gần đây</h2>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.fullName}</td>
                                        <td>{formatPrice(order.totalPrice)}</td>
                                        <td>
                                            <span
                                                className={`status-badge ${getStatusBadgeClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;