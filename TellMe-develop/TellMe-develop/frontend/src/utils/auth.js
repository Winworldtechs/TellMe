export const getAccessToken = () => localStorage.getItem("access");
export const getRefreshToken = () => localStorage.getItem("refresh");

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
};
