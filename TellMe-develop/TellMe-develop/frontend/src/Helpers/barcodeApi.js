import { api } from "./api";

export const fetchOrders = () => api.get("/orders/");
export const fetchListingById = (id) => api.get(`/listing/${id}/`);
export const createListing = (data) => api.post("/listing/", data);
export const createViolation = (data) => api.post("/violation/", data);
export const createInterest = (data) => api.post("/interest/", data);