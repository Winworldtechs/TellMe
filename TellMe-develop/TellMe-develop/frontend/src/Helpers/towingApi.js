import { api } from "./api";

export const fetchTowingProviders = () => api.get("/towing/providers/");