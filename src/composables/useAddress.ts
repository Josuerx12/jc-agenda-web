import { api } from "@/boot/api";
import { ref } from "vue";

export interface AddressCity {
  id: string;
  name: string;
}

export interface AddressState {
  id: string;
  name: string;
  code: string;
}

export interface AddressResponse {
  zipCode: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: AddressCity;
  state: AddressState;
}

export function useAddress() {
  const isLoadingAddress = ref(false);
  const addressError = ref<string | null>(null);

  async function findAddressByZipCode(cep: string) {
    const normalizedCep = cep.replace(/\D/g, "");

    addressError.value = null;
    isLoadingAddress.value = true;

    try {
      const { data } = await api.get<AddressResponse>("/addresses", {
        params: { cep: normalizedCep }
      });

      return data;
    } catch (error) {
      addressError.value = "Não foi possível consultar este CEP.";
      throw error;
    } finally {
      isLoadingAddress.value = false;
    }
  }

  function clearAddressError() {
    addressError.value = null;
  }

  return {
    addressError,
    clearAddressError,
    findAddressByZipCode,
    isLoadingAddress
  };
}
