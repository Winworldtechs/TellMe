import { api } from "./api";

export const fetchSocialAccounts = () => api.get("/social/accounts/");
export const fetchSocialApplications = () => api.get("/social/applications/");
export const fetchSocialTokens = () => api.get("/social/tokens/");