import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../src/api/axiosClient";
import { CartContext } from "../../src/context/CartContext";
import "./SearchPage.css";
import debounce from "lodash/debounce";
import Swal from "sweetalert2";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;
    const { addToCart, message } = React.useContext(CartContext);
    const navigate = useNavigate();

    const fetchSearchResults = useCallback(
        debounce(async (searchQuery) => {
            console.log("Fetching search results for query:", searchQuery);
            try {
                const response = await axiosClient.get(`/products/search?keyword=${searchQuery}`);
                setProducts(response.data);
                setCurrentPage(1);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setProducts([]);
            }
        }, 500),
        []
    );

    useEffect(() => {
        if (query) {
            fetchSearchResults(query);
        }
        return () => fetchSearchResults.cancel();
    }, [query, fetchSearchResults]);

    useEffect(() => {
        if (message.text) {
            Swal.fire({
                icon: message.type === "success" ? "success" : "error",
                title: message.type === "success" ? "Thành công!" : "Lỗi!",
                text: message.text,
                confirmButtonText: "OK",
            });
        }
    }, [message]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

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

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product);
        } catch (error) {
            console.error("Failed to add to cart in SearchPage:", error);
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Không thể thêm sản phẩm vào giỏ hàng.",
                confirmButtonText: "OK",
            });
        }
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
                                        <button onClick={() => navigate(`/product/${product.id}`)}>
                                            Chi tiết
                                        </button>
                                        <button onClick={() => handleAddToCart(product)}>
                                            Thêm vào giỏ hàng
                                        </button>
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