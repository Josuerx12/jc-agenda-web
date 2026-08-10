import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "https://api-jcagenda.jcdev.com.br"
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
