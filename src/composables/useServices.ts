import { api } from "@/boot/api";
import { isAxiosError } from "axios";
import { ref } from "vue";

export interface CompanyService {
  id: string;
  companyId: string;
  name: string;
  price: number | string;
  description: string;
  durationInMinutes: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SimpleCompanyService {
  id: string;
  companyId: string;
  name: string;
}

export interface ServicesPaginationMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: Array<[ServicesSortField, ServicesSortDirection]>;
}

export interface ServicesPaginationLinks {
  current: string;
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
}

export interface ServicesResponse {
  data: CompanyService[];
  meta: ServicesPaginationMeta;
  links: ServicesPaginationLinks;
}

export type ServicesSortField =
  | "name"
  | "price"
  | "durationInMinutes"
  | "createdAt"
  | "updatedAt";
export type ServicesSortDirection = "ASC" | "DESC";

export interface ServicesQuery {
  page: number;
  limit: number;
  search?: string;
  minimumPrice?: number | null;
  maximumPrice?: number | null;
  durationInMinutes?: number | null;
  sortBy?: `${ServicesSortField}:${ServicesSortDirection}`;
}

export interface CreateServicePayload {
  name: string;
  price: number;
  description: string;
  durationInMinutes: number;
}

export type ServiceField = keyof CreateServicePayload;

interface ValidationErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  errors?: Partial<Record<ServiceField, string[]>>;
}

function buildServicesParams(query: ServicesQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sortBy: query.sortBy ?? "name:ASC"
  });

  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.minimumPrice != null) {
    params.append("filter.price", `$gte:${query.minimumPrice}`);
  }
  if (query.maximumPrice != null) {
    params.append("filter.price", `$lte:${query.maximumPrice}`);
  }
  if (query.durationInMinutes != null) {
    params.append("filter.durationInMinutes", `$eq:${query.durationInMinutes}`);
  }

  return params;
}

export function useServices() {
  const services = ref<CompanyService[]>([]);
  const simpleServices = ref<SimpleCompanyService[]>([]);
  const meta = ref<ServicesPaginationMeta>({
    itemsPerPage: 10,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
    sortBy: [["name", "ASC"]]
  });
  const isLoadingServices = ref(false);
  const isLoadingSimpleServices = ref(false);
  const isCreatingService = ref(false);
  const isUpdatingService = ref(false);
  const deletingServiceId = ref<string | null>(null);
  const servicesError = ref<string | null>(null);
  const createServiceError = ref<string | null>(null);
  const createServiceFieldErrors = ref<Partial<Record<ServiceField, string[]>>>(
    {}
  );

  async function listServices(query: ServicesQuery) {
    isLoadingServices.value = true;
    servicesError.value = null;

    try {
      const { data } = await api.get<ServicesResponse>("/services", {
        params: buildServicesParams(query)
      });
      services.value = data.data;
      meta.value = data.meta;
      return data;
    } catch (error) {
      servicesError.value = "Não foi possível carregar os serviços.";
      throw error;
    } finally {
      isLoadingServices.value = false;
    }
  }

  async function listSimpleServices() {
    isLoadingSimpleServices.value = true;

    try {
      const { data } = await api.get<SimpleCompanyService[]>(
        "/services/simple-list"
      );
      simpleServices.value = data;
      return data;
    } finally {
      isLoadingSimpleServices.value = false;
    }
  }

  async function getService(id: string) {
    return (await api.get<CompanyService>(`/services/${id}`)).data;
  }

  async function createService(payload: CreateServicePayload) {
    isCreatingService.value = true;
    createServiceError.value = null;
    createServiceFieldErrors.value = {};

    try {
      const response = await api.post<CompanyService>("/services", payload);
      if (response.status !== 201) {
        throw new Error(`Resposta inesperada: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      if (
        isAxiosError<ValidationErrorResponse>(error) &&
        error.response?.data
      ) {
        createServiceError.value = error.response.data.message;
        createServiceFieldErrors.value = error.response.data.errors ?? {};
      } else {
        createServiceError.value = "Não foi possível criar o serviço.";
      }
      throw error;
    } finally {
      isCreatingService.value = false;
    }
  }

  async function updateService(id: string, payload: CreateServicePayload) {
    isUpdatingService.value = true;
    createServiceError.value = null;
    createServiceFieldErrors.value = {};

    try {
      const response = await api.patch<CompanyService>(
        `/services/${id}`,
        payload
      );
      if (response.status !== 200) {
        throw new Error(`Resposta inesperada: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      setMutationError(error, "Não foi possível atualizar o serviço.");
      throw error;
    } finally {
      isUpdatingService.value = false;
    }
  }

  async function deleteService(id: string) {
    deletingServiceId.value = id;

    try {
      await api.delete(`/services/${id}`);
    } finally {
      deletingServiceId.value = null;
    }
  }

  function setMutationError(error: unknown, fallbackMessage: string) {
    if (isAxiosError<ValidationErrorResponse>(error) && error.response?.data) {
      createServiceError.value = error.response.data.message;
      createServiceFieldErrors.value = error.response.data.errors ?? {};
      return;
    }

    createServiceError.value = fallbackMessage;
  }

  function getCreateServiceFieldError(field: ServiceField) {
    return createServiceFieldErrors.value[field]?.join(" ");
  }

  function clearCreateServiceFieldError(field: ServiceField) {
    delete createServiceFieldErrors.value[field];
  }

  function clearCreateServiceErrors() {
    createServiceError.value = null;
    createServiceFieldErrors.value = {};
  }

  return {
    clearCreateServiceErrors,
    clearCreateServiceFieldError,
    createService,
    createServiceError,
    deleteService,
    deletingServiceId,
    getCreateServiceFieldError,
    getService,
    isCreatingService,
    isUpdatingService,
    isLoadingServices,
    isLoadingSimpleServices,
    listServices,
    listSimpleServices,
    meta,
    services,
    simpleServices,
    servicesError,
    updateService
  };
}
