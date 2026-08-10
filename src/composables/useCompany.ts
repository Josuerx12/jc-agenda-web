import { api, setApiCompanyId } from "@/boot/api";
import { defineStore } from "pinia";

export const useCompany = defineStore("company", {
  state: () => {
    return {
      id: "",
      cnpj: "",
      trandingName: "",
      companyName: "",
      email: "",
      phone: "",
      additionalPhone: "",
      address: {
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: ""
      }
    };
  },

  actions: {
    async resolveCompany(slug: string) {
      try {
        const result = await api.get<ResolveCompanyResponse>(
          `/company/resolve/${slug}`
        );

        this.id = result.data.id;
        this.cnpj = result.data.cnpj;
        this.trandingName = result.data.trandingName;
        this.companyName = result.data.corporateName;
        this.email = result.data.email;
        this.phone = result.data.phone;
        this.additionalPhone = result.data.additionalPhone;
        setApiCompanyId(result.data.id);
      } catch (error) {
        console.error("Error resolving company:", error);
        throw error;
      }
    }
  }
});

export interface ResolveCompanyResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: any;
  trandingName: string;
  corporateName: string;
  slug: string;
  cnpj: string;
  email: string;
  phone: string;
  additionalPhone: string;
}
