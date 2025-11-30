import { api } from "./api";

export const fetchCategories = () => api.get("/home/categories/");
export const fetchOffers = () => api.get("/home/offers/");
export const fetchRecentlyAdded = () => api.get("/home/recent/");
export const fetchMostBooked = () => api.get("/home/most-booked/");