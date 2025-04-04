// src/context/AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

    const login = (token, userName) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userName", userName);
        setIsLoggedIn(true);
        setUserName(userName);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("roles");
        setIsLoggedIn(false);
        setUserName("");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};