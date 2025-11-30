import { api } from "./api";

export const fetchPlans = () => api.get("/subscriptions/plans/");
export const fetchUserSubscriptions = () => api.get("/subscriptions/user/");
export const fetchNotificationLogs = () => api.get("/notifications/logs/");