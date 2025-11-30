import { api } from "./api";

export const fetchPayments = () => api.get("/payments/");
export const verifyPayment = (sessionId) => api.get(`/payments/verify/${sessionId}/`);