import { api } from "@/boot/api";
import { isAxiosError } from "axios";
import { ref } from "vue";

export interface RegistrationAddressPayload {
  zipCode: string;
  city: string;
  state: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
}

export interface RegistrationCompanyPayload {
  cnpj: string;
  trandingName: string;
  corporateName: string;
  slug: string;
  email: string;
  phone: string;
  additionalPhone: string;
  address: RegistrationAddressPayload;
}

export interface RegistrationUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegistrationPayload {
  user: RegistrationUserPayload;
  company: RegistrationCompanyPayload;
}

export type RegistrationFieldPath =
  | `user.${keyof RegistrationUserPayload}`
  | `company.${Exclude<keyof RegistrationCompanyPayload, "address">}`
  | `company.address.${keyof RegistrationAddressPayload}`;

export interface RegistrationValidationErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  errors: Partial<Record<RegistrationFieldPath, string[]>>;
}

export function useRegistration() {
  const isRegistering = ref(false);
  const registrationError = ref<string | null>(null);
  const registrationFieldErrors = ref<
    Partial<Record<RegistrationFieldPath, string[]>>
  >({});

  async function register(payload: RegistrationPayload) {
    registrationError.value = null;
    registrationFieldErrors.value = {};
    isRegistering.value = true;

    try {
      const response = await api.post<void>("/sign-up", payload);

      if (response.status !== 201) {
        throw new Error(`Resposta inesperada ao cadastrar: ${response.status}`);
      }
    } catch (error) {
      if (
        isAxiosError<RegistrationValidationErrorResponse>(error) &&
        error.response?.data.errors
      ) {
        registrationError.value = error.response.data.message;
        registrationFieldErrors.value = error.response.data.errors;
      } else {
        registrationError.value =
          "Não foi possível concluir o cadastro. Revise os dados e tente novamente.";
      }

      throw error;
    } finally {
      isRegistering.value = false;
    }
  }

  function getRegistrationFieldError(field: RegistrationFieldPath) {
    return registrationFieldErrors.value[field]?.join(" ");
  }

  function clearRegistrationFieldError(field: RegistrationFieldPath) {
    delete registrationFieldErrors.value[field];
  }

  return {
    isRegistering,
    register,
    registrationError,
    registrationFieldErrors,
    getRegistrationFieldError,
    clearRegistrationFieldError
  };
}
