import { api } from "@/boot/api";
import { isAxiosError } from "axios";
import { ref } from "vue";

export interface CompanyUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  userId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: CompanyUserProfile;
  services?: Array<{
    id: string;
    serviceId: string;
    service?: { id: string; name: string };
  }>;
}

export type CompanyUsersSort =
  | "user.firstName:ASC"
  | "user.firstName:DESC"
  | "user.lastName:ASC"
  | "user.lastName:DESC"
  | "user.email:ASC"
  | "user.email:DESC"
  | "user.phone:ASC"
  | "user.phone:DESC"
  | "createdAt:ASC"
  | "createdAt:DESC"
  | "updatedAt:ASC"
  | "updatedAt:DESC";

export interface CompanyUsersQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy?: CompanyUsersSort;
}

export interface CompanyUsersResponse {
  data: CompanyUser[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: Array<[string, "ASC" | "DESC"]>;
  };
  links: Record<string, string>;
}

export interface CreateCompanyUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  services: string[];
  isAdmin: boolean;
  isProfessional: boolean;
}

export type UpdateCompanyUserPayload = Partial<CreateCompanyUserPayload>;
export type CompanyUserField = keyof CreateCompanyUserPayload;

interface ValidationErrorResponse {
  message?: string;
  errors?: Partial<Record<CompanyUserField, string[]>>;
}

function buildParams(query: CompanyUsersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sortBy: query.sortBy ?? "user.firstName:ASC"
  });
  if (query.search?.trim()) params.set("search", query.search.trim());
  return params;
}

export function useCompanyUsers() {
  const companyUsers = ref<CompanyUser[]>([]);
  const meta = ref<CompanyUsersResponse["meta"]>({
    itemsPerPage: 10,
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
    sortBy: [["user.firstName", "ASC"]]
  });
  const isLoading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const deletingCompanyUserId = ref<string | null>(null);
  const listError = ref<string | null>(null);
  const mutationError = ref<string | null>(null);
  const fieldErrors = ref<Partial<Record<CompanyUserField, string[]>>>({});

  async function listCompanyUsers(query: CompanyUsersQuery) {
    isLoading.value = true;
    listError.value = null;
    try {
      const { data } = await api.get<CompanyUsersResponse>("/company-user", {
        params: buildParams(query)
      });
      companyUsers.value = data.data;
      meta.value = data.meta;
      return data;
    } catch (error) {
      listError.value = "Não foi possível carregar os usuários.";
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCompanyUser(payload: CreateCompanyUserPayload) {
    isCreating.value = true;
    clearMutationErrors();
    try {
      return (await api.post<CompanyUser>("/company-user", payload)).data;
    } catch (error) {
      setMutationError(error, "Não foi possível criar o usuário.");
      throw error;
    } finally {
      isCreating.value = false;
    }
  }

  async function getCompanyUser(id: string) {
    return (await api.get<CompanyUser>(`/company-user/${id}`)).data;
  }

  async function updateCompanyUser(
    id: string,
    payload: UpdateCompanyUserPayload
  ) {
    isUpdating.value = true;
    clearMutationErrors();
    try {
      return (await api.patch<CompanyUser>(`/company-user/${id}`, payload))
        .data;
    } catch (error) {
      setMutationError(error, "Não foi possível atualizar o usuário.");
      throw error;
    } finally {
      isUpdating.value = false;
    }
  }

  async function deleteCompanyUser(id: string) {
    deletingCompanyUserId.value = id;
    try {
      await api.delete(`/company-user/${id}`);
    } finally {
      deletingCompanyUserId.value = null;
    }
  }

  function setMutationError(error: unknown, fallback: string) {
    if (isAxiosError<ValidationErrorResponse>(error) && error.response?.data) {
      mutationError.value = error.response.data.message ?? fallback;
      fieldErrors.value = error.response.data.errors ?? {};
      return;
    }
    mutationError.value = fallback;
  }

  function fieldError(field: CompanyUserField) {
    return fieldErrors.value[field]?.join(" ");
  }

  function clearFieldError(field: CompanyUserField) {
    delete fieldErrors.value[field];
  }

  function clearMutationErrors() {
    mutationError.value = null;
    fieldErrors.value = {};
  }

  return {
    clearFieldError,
    clearMutationErrors,
    companyUsers,
    createCompanyUser,
    deleteCompanyUser,
    deletingCompanyUserId,
    fieldError,
    getCompanyUser,
    isCreating,
    isLoading,
    isUpdating,
    listCompanyUsers,
    listError,
    meta,
    mutationError,
    updateCompanyUser
  };
}
