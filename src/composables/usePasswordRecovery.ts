import { api } from "@/boot/api";
import { isAxiosError } from "axios";
import { ref } from "vue";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface PasswordRecoveryErrorResponse {
  message?: string | string[];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<PasswordRecoveryErrorResponse>(error)) return fallback;

  const message = error.response?.data.message;
  return Array.isArray(message) ? message.join(" ") : (message ?? fallback);
}

export function usePasswordRecovery() {
  const isRequesting = ref(false);
  const isResetting = ref(false);
  const requestError = ref<string | null>(null);
  const resetError = ref<string | null>(null);

  async function requestPasswordRecovery(payload: ForgotPasswordPayload) {
    requestError.value = null;
    isRequesting.value = true;

    try {
      await api.post("/forgot-password", payload);
    } catch (error) {
      requestError.value = getErrorMessage(
        error,
        "Não foi possível enviar a solicitação. Tente novamente."
      );
      throw error;
    } finally {
      isRequesting.value = false;
    }
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    resetError.value = null;
    isResetting.value = true;

    try {
      await api.post("/reset-password", payload);
    } catch (error) {
      resetError.value = getErrorMessage(
        error,
        "Não foi possível redefinir a senha. Verifique o token e tente novamente."
      );
      throw error;
    } finally {
      isResetting.value = false;
    }
  }

  function clearRequestError() {
    requestError.value = null;
  }

  function clearResetError() {
    resetError.value = null;
  }

  return {
    clearRequestError,
    clearResetError,
    isRequesting,
    isResetting,
    requestError,
    requestPasswordRecovery,
    resetError,
    resetPassword
  };
}
