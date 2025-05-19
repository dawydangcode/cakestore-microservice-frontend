import React, { createContext, useContext, useState } from 'react';

   export const AuthContext = createContext();

   export const AuthProvider = ({ children }) => {
       const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
       const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
       const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('roles')) || []);

       const login = (token, userName, userRoles) => {
           localStorage.setItem('token', token);
           localStorage.setItem('userName', userName);
           localStorage.setItem('roles', JSON.stringify(userRoles));
           setIsLoggedIn(true);
           setUserName(userName);
           setRoles(userRoles);
       };

       const logout = () => {
           localStorage.removeItem('token');
           localStorage.removeItem('userName');
           localStorage.removeItem('roles');
           setIsLoggedIn(false);
           setUserName('');
           setRoles([]);
       };

       return (
           <AuthContext.Provider value={{ isLoggedIn, userName, roles, login, logout }}>
               {children}
           </AuthContext.Provider>
       );
   };

   export const useAuth = () => useContext(AuthContext);