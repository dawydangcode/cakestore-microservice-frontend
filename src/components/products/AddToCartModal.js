import React, { useEffect } from "react";
import "./AddToCartModal.css";

const AddToCartModal = ({ product, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true); // Bắt đầu fadeOut sau 2.7 giây (trước khi đóng)
            setTimeout(onClose, 500); // Đóng hoàn toàn sau 0.3 giây (thời gian fadeOut)
        }, 2500);

        return () => clearTimeout(timer);
    }, [onClose]);

    const [fadeOut, setFadeOut] = React.useState(false);

    const handleConfirm = () => {
        setFadeOut(true); // Bắt đầu fadeOut khi nhấn Xác nhận
        setTimeout(onClose, 300); // Đóng hoàn toàn sau 0.3 giây
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${fadeOut ? "fade-out" : ""}`}>
                <h3>Đã thêm vào giỏ hàng!</h3>
                <div className="modal-product-info">
                    <img
                        src={product.image || "https://placehold.co/50x50"}
                        alt={product.name}
                        className="modal-product-image"
                    />
                    <div className="modal-product-details">
                        <p><strong>{product.name}</strong></p>
                        <p>Giá: {product.price.toLocaleString()}đ</p>
                    </div>
                </div>
                <button className="modal-confirm-btn" onClick={handleConfirm}>
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

export default AddToCartModal;