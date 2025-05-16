import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SearchPage.css"; // Tạo file CSS riêng

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/products/search?keyword=${query}`);
                setProducts(response.data);
                setCurrentPage(1); // Reset về trang 1 khi thay đổi query
            } catch (error) {
                console.error("Error fetching search results:", error);
                setProducts([]);
            }
        };
        if (query) fetchSearchResults();
    }, [query]);

    // Phân trang
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="search-page">
            <div className="search-content">
                <h2>Kết quả tìm kiếm cho: "{query}" ({products.length} sản phẩm)</h2>
                {products.length > 0 ? (
                    <>
                        <div className="search-results">
                            {currentProducts.map((product) => (
                                <div key={product.id} className="search-result-item">
                                    <img
                                        src={product.image || "https://placehold.co/200x200"}
                                        alt={product.name}
                                        className="search-result-image"
                                    />
                                    <div className="search-result-details">
                                        <h3>{product.name}</h3>
                                        <p>{product.price.toLocaleString()} đ</p>
                                        <button onClick={() => window.location.href = `/product/${product.id}`}>
                                            Chi tiết
                                        </button>
                                        <button>Thêm vào giỏ hàng</button> {/* Cần tích hợp CartContext nếu muốn chức năng này */}
                                    </div>
                                </div>
                            ))}
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
                    </>
                ) : (
                    <p>Không tìm thấy sản phẩm nào.</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;