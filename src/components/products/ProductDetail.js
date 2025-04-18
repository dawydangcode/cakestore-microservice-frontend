import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("details");
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log(`Đang lấy sản phẩm với id: ${id}`);
                const response = await axiosClient.get(`/products/${id}`);
                console.log("Dữ liệu API:", response.data);
                setProduct(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm:", error.response || error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product || !product.categoryId) return;
            try {
                const response = await axiosClient.get("/products/list");
                // Chỉ lấy sản phẩm có cùng categoryId, loại bỏ sản phẩm hiện tại
                const filteredProducts = response.data
                    .filter(p => p.categoryId === product.categoryId && p.id !== parseInt(id))
                    .slice(0, 4); // Giới hạn tối đa 4 sản phẩm
                setRelatedProducts(filteredProducts);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm liên quan:", error);
                setRelatedProducts([]);
            }
        };

        fetchRelatedProducts();
    }, [product, id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            alert(`${product.name} đã được thêm vào giỏ hàng!`);
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (!product) {
        return <div>Không tìm thấy sản phẩm</div>;
    }

    return (
        <div className="product-detail">
            <div className="product-container">
                {/* Phần hình ảnh sản phẩm */}
                <div className="product-image-section">
                    <img
                        src={product.image || "https://placehold.co/200x200"}
                        alt={product.name}
                        className="product-image"
                    />
                    <div className="small-image">
                        <img
                            src={product.image || "https://placehold.co/200x200"}
                            alt={product.name}
                            className="small-product-image"
                        />
                    </div>
                </div>

                {/* Phần thông tin sản phẩm */}
                <div className="product-info-section">
                    <h2>{product.name.toUpperCase()}</h2>
                    <p className="price">{product.price.toLocaleString()}đ</p>
                    <div className="product-details">
                        <p><strong>THƯƠNG HIỆU:</strong> {product.brand || "🍰 Sweet Shop"}</p>
                        <p><strong>LOẠI:</strong> {product.categoryId}</p>
                        <p><strong>TÌNH TRẠNG:</strong> {product.stock !== undefined ? `${product.stock} sản phẩm` : "Không có thông tin tồn kho"}</p>
                    </div>
                    <div className="quantity-selector">
                        <span>SỐ LƯỢNG:</span>
                        <div className="quantity-controls">
                            <button onClick={() => handleQuantityChange(-1)}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>
                    <button className="add-to-cart" onClick={handleAddToCart}>
                        Thêm vào giỏ
                    </button>
                    <div className="share-gift">
                        <button>Chia sẻ qua:</button>
                    </div>
                </div>
            </div>

            {/* Phần tab thông tin */}
            <div className="tabs-section">
                <div className="tabs">
                    <button
                        className={activeTab === "details" ? "active" : ""}
                        onClick={() => setActiveTab("details")}
                    >
                        Chi tiết sản phẩm
                    </button>
                    <button
                        className={activeTab === "reviews" ? "active" : ""}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Nhận xét
                    </button>
                    <button
                        className={activeTab === "policy" ? "active" : ""}
                        onClick={() => setActiveTab("policy")}
                    >
                        Chính sách mua hàng
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === "details" && (
                        <div>
                            <p>{product.description || "Không có mô tả chi tiết."}</p>
                        </div>
                    )}
                    {activeTab === "reviews" && (
                        <div>
                            <p>Chưa có nhận xét nào cho sản phẩm này.</p>
                        </div>
                    )}
                    {activeTab === "policy" && (
                        <div>
                            <p>- Miễn phí giao hàng cho đơn từ 500.000đ.</p>
                            <p>- Đổi trả trong 24h nếu sản phẩm lỗi.</p>
                            <p>- Liên hệ hotline: 0123 456 789 để được hỗ trợ.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Phần sản phẩm liên quan */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h3>Sản phẩm liên quan</h3>
                    <div className="related-products">
                        {relatedProducts.map((relatedProduct) => (
                            <div key={relatedProduct.id} className="related-product-card">
                                <img
                                    src={relatedProduct.image || "  https://placehold.co/200x200"}
                                    alt={relatedProduct.name}
                                    className="related-product-image"
                                />
                                <h4>{relatedProduct.name}</h4>
                                <p>{relatedProduct.price.toLocaleString()}đ</p>
                                <button onClick={() => navigate(`/product/${relatedProduct.id}`)}>
                                    Mua Ngay
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button className="back-button" onClick={() => navigate("/products")}>
                Quay lại danh sách sản phẩm
            </button>
        </div>
    );
};

export default ProductDetail;