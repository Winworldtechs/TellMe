export const setToken = (token) => localStorage.setItem("authToken", token);
export const getToken = () => localStorage.getItem("authToken");
export const removeToken = () => localStorage.removeItem("authToken");

export const isAuthenticated = () => !!getToken();

export const setUser = (user) => localStorage.setItem("userInfo", JSON.stringify(user));
export const getUser = () => JSON.parse(localStorage.getItem("userInfo") || "null");
export const removeUser = () => localStorage.removeItem("userInfo");