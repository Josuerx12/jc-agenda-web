import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.API_KEY
  },
});

export function setApiCompanyId(companyId: string | null) {
  if (companyId) {
    api.defaults.headers.common["x-company-id"] = companyId;
  } else {
    delete api.defaults.headers.common["x-company-id"];
  }
}

export function setApiAccessToken(accessToken: string | null) {
  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
