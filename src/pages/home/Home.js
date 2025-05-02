import React from "react";
import ProductList from "../../components/products/ProductList";
const Home = () => {
    return (
        <div>
            <h1>Welcome to the Sweet Shop! </h1>
            <p>Discover our delicious cakes and sweets.</p>
            <ProductList />
        </div>
    );
};

export default Home;
