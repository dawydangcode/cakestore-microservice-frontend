import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import "./ProductList.css";
import AddToCartModal from "./AddToCartModal";
import debounce from "lodash/debounce";

const ProductList = memo(({ products: initialProducts = [] }) => {
    const [products, setProducts] = useState(initialProducts);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    const fetchData = useCallback(
        debounce(async () => {
            console.log("Fetching products for categoryId:", categoryId);
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    axiosClient.get("/products/list"),
                    axiosClient.get("/categories"),
                ]);
                setProducts(
                    categoryId
                        ? productsResponse.data.filter((p) => p.categoryId === parseInt(categoryId))
                        : productsResponse.data
                );
                setCategories(categoriesResponse.data);
                setCurrentPage(1);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }, 300),
        [categoryId]
    );

    useEffect(() => {
        console.log("useEffect triggered with categoryId:", categoryId, "initialProducts:", initialProducts.length);
        if (initialProducts.length === 0 && !products.length) {
            fetchData();
        } else if (initialProducts.length > 0) {
            setProducts(initialProducts);
            setCategories([]);
        }
        return () => fetchData.cancel();
    }, [categoryId, initialProducts, fetchData, products.length]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const handleAddToCart = (product) => {
        console.log("Adding to cart:", product.id);
        addToCart(product);
        setSelectedProduct(product);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 3000);
    };

    const handleCategoryClick = (categoryId) => {
        console.log("Navigating to category:", categoryId);
        if (categoryId) {
            navigate(`/products/category/${categoryId}`);
        } else {
            navigate("/products");
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="parent">
            <div className="div1">
                <h3>Danh mục</h3>
                <ul className="category-list">
                    <li
                        className={!categoryId ? "active" : ""}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Tất cả
                    </li>
                    {categories.map((category) => (
                        <li
                            key={category.categoryId}
                            className={
                                categoryId && parseInt(categoryId) === category.categoryId
                                    ? "active"
                                    : ""
                            }
                            onClick={() => handleCategoryClick(category.categoryId)}
                        >
                            {category.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="div2">
                <div className="product-list">
                    {currentProducts.length > 0 ? (
                        currentProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-image-wrapper">
                                    <img
                                        src={product.image || "https://placehold.co/200x200"}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                </div>
                                <h3>{product.name}</h3>
                                <p>{product.price.toLocaleString()} đ</p>
                                <button onClick={() => navigate(`/product/${product.id}`)}>
                                    Chi tiết
                                </button>
                                <button onClick={() => handleAddToCart(product)}>
                                    Thêm vào giỏ hàng
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Không có sản phẩm nào trong danh mục này.</p>
                    )}
                </div>

                {products.length > productsPerPage && (
                    <div className="pagination">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Trước
                        </button>
                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={`pagination-btn ${currentPage === number ? "active" : ""}`}
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Tiếp
                        </button>
                    </div>
                )}
            </div>

            {showModal && selectedProduct && (
                <AddToCartModal product={selectedProduct} onClose={handleModalClose} />
            )}
        </div>
    );
});

export default ProductList;