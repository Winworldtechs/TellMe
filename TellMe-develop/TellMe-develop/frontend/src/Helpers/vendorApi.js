import { api } from "./api";

export const fetchVendorsByCategory = (slug) =>
  api.get(`/categories/${slug}/vendors/`);