import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

const BASE_URL = "http://127.0.0.1:8000/api/accounts/";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${BASE_URL}login/`, { email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await fetchProfile(res.data.access);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // 🔹 Register
  const register = async (formData) => {
    try {
      const res = await axios.post(`${BASE_URL}register/`, formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await fetchProfile(res.data.access);
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  // 🔹 Fetch user profile
  const fetchProfile = async (token = null) => {
    try {
      const access = token || localStorage.getItem("access");
      const res = await axios.get(`${BASE_URL}profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setUser(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        await refreshAccessToken();
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Refresh token if expired
  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      const res = await axios.post(`${BASE_URL}refresh/`, { refresh });
      localStorage.setItem("access", res.data.access);
      await fetchProfile(res.data.access);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  // 🔹 On app load, check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) fetchProfile(token);
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ⭐ ADD THIS — Fixes your error
export const useAuth = () => useContext(AuthContext);
