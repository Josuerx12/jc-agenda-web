<template>
  <q-page padding class="form-page">
    <div class="form-content q-mx-auto">
      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Voltar para usuários"
        color="primary"
        class="q-mb-md"
        to="/dashboard/usuarios"
      />
      <q-card flat bordered class="form-card">
        <q-card-section class="form-header"
          ><div class="text-overline text-primary text-weight-bold">{{
            isEditing ? "Editar cadastro" : "Novo cadastro"
          }}</div
          ><h1 class="text-h4 text-weight-bold q-my-xs">{{
            isEditing ? "Editar usuário" : "Adicionar usuário"
          }}</h1
          ><p class="text-body1 text-grey-7 q-my-none"
            >Defina os dados de acesso, permissões e serviços realizados.</p
          ></q-card-section
        >
        <q-separator />
        <div v-if="isLoading" class="q-pa-lg q-gutter-md"
          ><q-skeleton type="QInput" /><q-skeleton type="QInput" /><q-skeleton
            type="QInput" /><q-skeleton type="QInput"
        /></div>
        <q-banner
          v-else-if="loadError"
          rounded
          class="q-ma-lg bg-red-1 text-negative"
          ><template #avatar><q-icon name="error_outline" /></template
          >{{ loadError
          }}<template #action
            ><q-btn
              flat
              no-caps
              color="negative"
              label="Tentar novamente"
              @click="loadDetails" /></template
        ></q-banner>
        <q-form v-else @submit.prevent="submit">
          <q-card-section class="form-fields">
            <q-banner
              v-if="usersApi.mutationError.value"
              rounded
              class="bg-red-1 text-negative q-mb-sm"
              ><template #avatar><q-icon name="error_outline" /></template
              >{{ usersApi.mutationError.value }}</q-banner
            >
            <div class="row q-col-gutter-md"
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.firstName"
                  v-bind="fieldProps('firstName')"
                  outlined
                  autofocus
                  label="Nome"
                  :rules="[required]"
                  @update:model-value="
                    usersApi.clearFieldError('firstName')
                  " /></div
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.lastName"
                  v-bind="fieldProps('lastName')"
                  outlined
                  label="Sobrenome"
                  :rules="[required]"
                  @update:model-value="
                    usersApi.clearFieldError('lastName')
                  " /></div
            ></div>
            <q-input
              v-model="form.email"
              v-bind="fieldProps('email')"
              outlined
              type="email"
              label="E-mail"
              :rules="[required, validEmail]"
              @update:model-value="usersApi.clearFieldError('email')"
            />
            <div class="row q-col-gutter-md"
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.phone"
                  v-bind="fieldProps('phone')"
                  outlined
                  label="Telefone"
                  mask="(##) #####-####"
                  unmasked-value
                  :rules="[required]"
                  @update:model-value="
                    usersApi.clearFieldError('phone')
                  " /></div
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.password"
                  v-bind="fieldProps('password')"
                  outlined
                  :type="showPassword ? 'text' : 'password'"
                  :label="isEditing ? 'Nova senha (opcional)' : 'Senha'"
                  :rules="isEditing ? [] : [required, minimumPassword]"
                  ><template #append
                    ><q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="
                        showPassword = !showPassword
                      " /></template></q-input></div
            ></div>
            <div class="roles-box"
              ><div class="text-subtitle2 text-weight-bold q-mb-sm"
                >Permissões</div
              ><div class="row q-gutter-md"
                ><q-toggle
                  v-model="form.isAdmin"
                  color="primary"
                  label="Administrador" /><q-toggle
                  v-model="form.isProfessional"
                  color="primary"
                  label="Profissional" /></div
            ></div>
            <q-select
              v-if="form.isProfessional"
              v-model="form.services"
              v-bind="fieldProps('services')"
              outlined
              multiple
              use-chips
              emit-value
              map-options
              option-value="id"
              option-label="name"
              label="Serviços realizados"
              :options="servicesApi.simpleServices.value"
              :loading="servicesApi.isLoadingSimpleServices.value"
              @update:model-value="usersApi.clearFieldError('services')"
            >
              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  color="purple-1"
                  text-color="primary"
                  :tabindex="scope.tabindex"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  {{ serviceName(scope.opt) }}
                </q-chip>
              </template>
            </q-select>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-lg"
            ><q-btn
              flat
              no-caps
              label="Cancelar"
              to="/dashboard/usuarios"
              :disable="isSaving" /><q-btn
              type="submit"
              unelevated
              no-caps
              rounded
              color="primary"
              :label="isEditing ? 'Salvar alterações' : 'Criar usuário'"
              :loading="isSaving"
          /></q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  useCompanyUsers,
  type CompanyUserField,
  type CreateCompanyUserPayload,
  type UpdateCompanyUserPayload
} from "@/composables/useCompanyUsers";
import { useServices } from "@/composables/useServices";
import { isAxiosError } from "axios";
import { useQuasar } from "quasar";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const usersApi = useCompanyUsers();
const servicesApi = useServices();
const id = computed(() =>
  typeof route.params.id === "string" ? route.params.id : null
);
const isEditing = computed(() => Boolean(id.value));
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const showPassword = ref(false);
const form = reactive<CreateCompanyUserPayload>(emptyForm());
const isSaving = computed(
  () => usersApi.isCreating.value || usersApi.isUpdating.value
);
const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const validEmail = (value: string) =>
  /^\S+@\S+\.\S+$/.test(value) || "Informe um e-mail válido";
const minimumPassword = (value: string) =>
  value.length >= 8 || "A senha deve ter ao menos 8 caracteres";

function emptyForm(): CreateCompanyUserPayload {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    services: [],
    isAdmin: false,
    isProfessional: true
  };
}
function fieldProps(field: CompanyUserField) {
  const message = usersApi.fieldError(field);
  return { error: Boolean(message), errorMessage: message };
}
function serviceName(option: unknown) {
  if (typeof option === "object" && option && "name" in option) {
    return String(option.name);
  }

  const serviceId = String(option);
  return (
    servicesApi.simpleServices.value.find(service => service.id === serviceId)
      ?.name ?? serviceId
  );
}
async function loadDetails() {
  if (!id.value) return;
  isLoading.value = true;
  loadError.value = null;
  try {
    const companyUser = await usersApi.getCompanyUser(id.value);
    Object.assign(form, {
      firstName: companyUser.user.firstName,
      lastName: companyUser.user.lastName,
      email: companyUser.user.email,
      phone: companyUser.user.phone.replace(/\D/g, ""),
      password: "",
      services: companyUser.services?.map(service => service.serviceId) ?? [],
      isAdmin: companyUser.isAdmin,
      isProfessional: companyUser.isProfessional
    });
  } catch (error) {
    loadError.value =
      isAxiosError(error) && error.response?.status === 404
        ? "Usuário não encontrado."
        : "Não foi possível carregar o usuário.";
  } finally {
    isLoading.value = false;
  }
}
async function submit() {
  try {
    if (id.value) {
      const payload: UpdateCompanyUserPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        services: form.services,
        isAdmin: form.isAdmin,
        isProfessional: form.isProfessional
      };
      if (form.password) payload.password = form.password;
      await usersApi.updateCompanyUser(id.value, payload);
    } else {
      await usersApi.createCompanyUser({ ...form });
    }
    $q.notify({
      type: "positive",
      position: "top",
      message: isEditing.value
        ? "Usuário atualizado com sucesso."
        : "Usuário criado com sucesso.",
      timeout: 3000
    });
    await router.push({
      path: "/dashboard/usuarios",
      query: { refresh: "1" }
    });
  } catch {}
}
onMounted(async () => {
  usersApi.clearMutationErrors();
  await Promise.allSettled([servicesApi.listSimpleServices(), loadDetails()]);
});
</script>

<style scoped>
.form-page {
  background: #faf9fb;
}
.form-content {
  width: 100%;
  max-width: 860px;
  padding-block: 20px 36px;
}
.form-card {
  border-radius: 18px;
  border-color: rgb(91 42 110 / 10%);
}
.form-header {
  padding: 28px;
}
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 28px;
}
.roles-box {
  padding: 14px 16px;
  border: 1px solid rgb(0 0 0 / 12%);
  border-radius: 8px;
}
@media (max-width: 700px) {
  .form-page {
    padding: 16px 12px;
  }
  .form-content {
    padding-block: 8px 24px;
  }
  .form-header,
  .form-fields {
    padding: 20px;
  }
  .form-header h1 {
    font-size: 1.7rem;
  }
}
</style>
