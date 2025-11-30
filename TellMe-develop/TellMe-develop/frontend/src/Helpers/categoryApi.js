import { api } from "./api";

export const fetchServiceCategories = () => api.get("/categories/");