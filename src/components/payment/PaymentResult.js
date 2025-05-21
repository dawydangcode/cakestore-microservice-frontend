// src/components/PaymentResult.js
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./PaymentResult.css";

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const status = query.get("status");
        const orderCode = query.get("orderCode");
        const cancel = query.get("cancel") === "true";

        if (status === "PAID") {
            Swal.fire({
                icon: "success",
                title: "Thanh toán thành công!",
                text: `Đơn hàng #${orderCode} đã được thanh toán.`,
                confirmButtonText: "Về trang chủ",
                showCancelButton: true,
                cancelButtonText: "Xem đơn hàng"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/");
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    navigate(`/order/${orderCode}`);
                }
            });
        } else if (status === "CANCELLED" || cancel) {
            Swal.fire({
                icon: "warning",
                title: "Thanh toán bị hủy",
                text: `Đơn hàng #${orderCode} đã bị hủy.`,
                confirmButtonText: "Về trang chủ"
            }).then(() => {
                navigate("/");
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Không xác định được trạng thái thanh toán.",
                confirmButtonText: "Về trang chủ"
            }).then(() => {
                navigate("/");
            });
        }
    }, [location, navigate]);

    return (
        <div className="payment-result-page">
            <h2>Đang xử lý trạng thái thanh toán...</h2>
        </div>
    );
};

export default PaymentResult;