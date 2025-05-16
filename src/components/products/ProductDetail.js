import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductDetail.css";
import AddToCartModal from "./AddToCartModal";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("details");
    const [selectedImage, setSelectedImage] = useState(0);
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const [showModal, setShowModal] = useState(false);

    // Giả định có nhiều hình ảnh cho sản phẩm
    const productImages = [
        product?.image || "https://placehold.co/400x400"
    ];

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
        // Cuộn lên đầu trang khi component mount
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product || !product.categoryId) return;
            try {
                const response = await axiosClient.get("/products/list");
                const filteredProducts = response.data
                    .filter(p => p.categoryId === product.categoryId && p.id !== parseInt(id))
                    .slice(0, 4);
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
            setShowModal(true);
            setTimeout(() => setShowModal(false), 3000); // Tắt modal sau 3 giây
        }
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const getStockStatus = (stock) => {
        if (!stock && stock !== 0) return null;
        
        if (stock === 0) {
            return <span className="stock-status out-of-stock">Hết hàng</span>;
        } else if (stock < 10) {
            return <span className="stock-status low-stock">Sắp hết hàng</span>;
        } else {
            return <span className="stock-status in-stock">Còn hàng</span>;
        }
    };

    const buyNow = () => {
        handleAddToCart();
        navigate("/cart");
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <button className="back-button" onClick={() => navigate("/products")}>
                    Quay lại danh sách sản phẩm
                </button>
            </div>
        );
    }

    return (
        <div className="product-detail">
            <div className="product-container">
                <div className="product-image-section">
                    <img
                        src={productImages[selectedImage]}
                        alt={product.name}
                        className="product-image"
                    />
                    <div className="small-images-container">
                        {productImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${product.name} - Ảnh ${index + 1}`}
                                className={`small-product-image ${selectedImage === index ? 'active' : ''}`}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="product-info-section">
                    <h2>{product.name}</h2>
                    <div className="price">
                        <span className="price-label">Giá:</span>
                        {product.price.toLocaleString()}đ
                    </div>
                    
                    <div className="product-details">
                        <p><strong>THƯƠNG HIỆU:</strong> {product.brand || "🍰 Sweet Shop"}</p>
                        <p><strong>LOẠI SẢN PHẨM:</strong> {product.category ? product.category.name : "Không xác định"}</p>
                        <p>
                            <strong>TÌNH TRẠNG:</strong> 
                            {product.stock !== undefined ? `${product.stock} sản phẩm` : "Không có thông tin tồn kho"}
                            {getStockStatus(product.stock)}
                        </p>
                    </div>
                    
                    <div className="quantity-section">
                        <span className="quantity-label">SỐ LƯỢNG:</span>
                        <div className="quantity-controls">
                            <button onClick={() => handleQuantityChange(-1)}>-</button>
                            <span>{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)}>+</button>
                        </div>
                    </div>
                    
                    <div className="buttons-container">
                        <button className="add-to-cart" onClick={handleAddToCart}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Thêm vào giỏ
                        </button>
                        <button className="add-to-cart" style={{background: "#e53935"}} onClick={buyNow}>
                            Mua ngay
                        </button>
                    </div>
                    
                    <div className="share-container">
                        <span className="share-label">Chia sẻ:</span>
                        <div className="social-buttons">
                            <button className="social-button facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </button>
                            <button className="social-button twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </button>
                            <button className="social-button pinterest">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.383 0 0 5.383 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.217-.937 1.401-5.965 1.401-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.208 0 1.031.397 2.137.893 2.739.098.119.112.224.083.345-.091.375-.293 1.199-.334 1.365-.053.225-.173.271-.4.165-1.481-.698-2.407-2.867-2.407-4.614 0-3.778 2.75-7.143 7.929-7.143 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.042-1.002 2.349-1.492 3.146C9.57 23.812 10.763 24 12 24c6.617 0 12-5.383 12-12S18.617 0 12 0z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
                        Đánh giá & Nhận xét
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
                            <p>{product.description || "Không có mô tả chi tiết cho sản phẩm này."}</p>
                        </div>
                    )}
                    {activeTab === "reviews" && (
                        <div>
                            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                            <p>Hãy là người đầu tiên đánh giá sản phẩm!</p>
                        </div>
                    )}
                    {activeTab === "policy" && (
                        <div>
                            <p><strong>Chính sách giao hàng:</strong></p>
                            <p>- Miễn phí giao hàng cho đơn từ 500.000đ trong nội thành.</p>
                            <p>- Giao hàng dự kiến từ 2-4 ngày làm việc.</p>
                            
                            <p><strong>Chính sách đổi trả:</strong></p>
                            <p>- Đổi trả trong vòng 24h nếu sản phẩm bị lỗi do nhà sản xuất.</p>
                            <p>- Không áp dụng đổi trả với sản phẩm đã qua sử dụng.</p>
                            
                            <p><strong>Hỗ trợ khách hàng:</strong></p>
                            <p>- Liên hệ hotline: 0123 456 789 để được hỗ trợ.</p>
                            <p>- Email hỗ trợ: support@sweetshop.com</p>
                        </div>
                    )}
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h3>Sản phẩm liên quan</h3>
                    <div className="related-products">
                        {relatedProducts.map((relatedProduct) => (
                            <div key={relatedProduct.id} className="related-product-card">
                                <img
                                    src={relatedProduct.image || "https://placehold.co/200x200"}
                                    alt={relatedProduct.name}
                                    className="related-product-image"
                                />
                                <h4>{relatedProduct.name}</h4>
                                <p>{relatedProduct.price.toLocaleString()}đ</p>
                                <button onClick={() => navigate(`/product/${relatedProduct.id}`)}>
                                    Xem chi tiết
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button className="back-button" onClick={() => navigate("/products")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Quay lại danh sách sản phẩm
            </button>

            {showModal && product && (
                <AddToCartModal product={product} onClose={handleModalClose} />
            )}
        </div>
    );
};

export default ProductDetail;