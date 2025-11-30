import axios from "axios";

// Django backend का URL यहाँ डालो
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/accounts/",
});

// हर request के साथ token भेजने के लिए interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;