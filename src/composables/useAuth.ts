import { api, setApiAccessToken, setApiCompanyId } from "@/boot/api";
import { defineStore } from "pinia";
import { Cookies } from "quasar";

const ACCESS_TOKEN_COOKIE = "jc_access_token";
const ACCESS_TOKEN_SESSION_KEY = "jc_access_token";
const COMPANY_ID_COOKIE = "jc_company_id";
const COMPANY_ID_SESSION_KEY = "jc_company_id";
let sessionRestorePromise: Promise<AuthenticatedUser | null> | null = null;

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isAdmin: boolean;
  isMaster: boolean;
  isBlocked: boolean;
}

interface ApiErrorResponse {
  message?: string;
}

function getStoredAccessToken() {
  return (
    Cookies.get<string>(ACCESS_TOKEN_COOKIE) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_SESSION_KEY)
  );
}

function getStoredCompanyId() {
  return (
    Cookies.get<string>(COMPANY_ID_COOKIE) ??
    window.sessionStorage.getItem(COMPANY_ID_SESSION_KEY)
  );
}

function persistSession(
  accessToken: string,
  companyId: string,
  rememberMe: boolean
) {
  removeStoredSession();

  if (rememberMe) {
    const cookieOptions = {
      expires: 1,
      path: "/",
      sameSite: "Strict" as const,
      secure: window.location.protocol === "https:"
    };

    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
    Cookies.set(COMPANY_ID_COOKIE, companyId, cookieOptions);
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_SESSION_KEY, accessToken);
    window.sessionStorage.setItem(COMPANY_ID_SESSION_KEY, companyId);
  }
}

function removeStoredSession() {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(COMPANY_ID_COOKIE, { path: "/" });
  window.sessionStorage.removeItem(ACCESS_TOKEN_SESSION_KEY);
  window.sessionStorage.removeItem(COMPANY_ID_SESSION_KEY);
}

export const useAuth = defineStore("auth", {
  state: () => ({
    user: null as AuthenticatedUser | null,
    isAuthenticating: false,
    isRestoringSession: false,
    sessionInitialized: false,
    authError: null as string | null
  }),

  getters: {
    isAuthenticated: state => Boolean(state.user)
  },

  actions: {
    async signIn(
      payload: SignInPayload,
      companyId: string,
      rememberMe = false
    ) {
      this.authError = null;
      this.isAuthenticating = true;
      setApiCompanyId(companyId);

      try {
        const { data } = await api.post<SignInResponse>("/sign-in", payload);

        persistSession(data.accessToken, companyId, rememberMe);
        setApiAccessToken(data.accessToken);

        const user = await this.getMe();
        this.sessionInitialized = true;
        return user;
      } catch (error) {
        this.clearSession();

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const response = (error as { response?: { data?: ApiErrorResponse } })
            .response;
          this.authError =
            response?.data?.message ?? "E-mail ou senha inválidos.";
        } else {
          this.authError = "Não foi possível entrar. Tente novamente.";
        }

        throw error;
      } finally {
        this.isAuthenticating = false;
      }
    },

    async getMe() {
      const { data } = await api.get<AuthenticatedUser>("/me");
      this.user = data;
      return data;
    },

    async restoreSession() {
      const accessToken = getStoredAccessToken();
      const companyId = getStoredCompanyId();
      if (!accessToken) {
        this.sessionInitialized = true;
        return null;
      }

      this.isRestoringSession = true;
      setApiAccessToken(accessToken);
      setApiCompanyId(companyId);

      try {
        return await this.getMe();
      } catch {
        this.clearSession();
        return null;
      } finally {
        this.isRestoringSession = false;
        this.sessionInitialized = true;
      }
    },

    async ensureSession() {
      if (this.user) return this.user;
      if (this.sessionInitialized) return null;

      sessionRestorePromise ??= this.restoreSession().finally(() => {
        sessionRestorePromise = null;
      });

      return await sessionRestorePromise;
    },

    clearSession() {
      this.user = null;
      this.sessionInitialized = true;
      setApiAccessToken(null);
      setApiCompanyId(null);
      removeStoredSession();
    },

    logout() {
      this.clearSession();
    }
  }
});

const storedAccessToken = getStoredAccessToken();
const storedCompanyId = getStoredCompanyId();
if (storedAccessToken) {
  setApiAccessToken(storedAccessToken);
}
if (storedCompanyId) {
  setApiCompanyId(storedCompanyId);
}
