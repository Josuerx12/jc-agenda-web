<template>
  <q-page padding class="users-page">
    <div class="users-content q-mx-auto">
      <header class="page-header row items-start justify-between q-mb-lg">
        <div>
          <div class="text-overline text-primary text-weight-bold">Equipe</div>
          <h1 class="text-h4 text-weight-bold q-my-xs">Usuários</h1>
          <p class="text-body1 text-grey-7 q-my-none">
            Gerencie administradores e profissionais da empresa.
          </p>
        </div>
        <q-btn
          unelevated
          no-caps
          rounded
          color="primary"
          icon="person_add"
          label="Novo usuário"
          class="new-user-button"
          @click="openCreateDialog"
        />
      </header>

      <q-card flat bordered class="filters-card q-mb-lg">
        <q-card-section class="row items-center q-col-gutter-sm">
          <div class="col-12 col-md">
            <q-input
              v-model="query.search"
              outlined
              dense
              clearable
              debounce="400"
              label="Buscar por nome, e-mail ou telefone"
              @update:model-value="applyFilters"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="query.sortBy"
              outlined
              dense
              emit-value
              map-options
              label="Ordenar por"
              :options="sortOptions"
              @update:model-value="applyFilters"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-markup-table v-if="isLoading" flat bordered class="users-table gt-xs">
        <thead
          ><tr
            ><th v-for="column in columns" :key="column.name"
              ><q-skeleton type="text" /></th></tr
        ></thead>
        <tbody
          ><tr v-for="index in 6" :key="index"
            ><td v-for="column in columns" :key="column.name"
              ><q-skeleton type="text" /></td></tr
        ></tbody>
      </q-markup-table>
      <div v-if="isLoading" class="users-grid lt-sm">
        <q-card v-for="index in 4" :key="index" flat bordered
          ><q-card-section
            ><q-skeleton type="text" width="65%" /><q-skeleton
              type="text"
              width="45%" /><q-skeleton
              type="text"
              class="q-mt-md" /></q-card-section
        ></q-card>
      </div>

      <q-banner v-else-if="listError" rounded class="bg-red-1 text-negative">
        <template #avatar><q-icon name="cloud_off" /></template>
        {{ listError }}
        <template #action
          ><q-btn
            flat
            no-caps
            color="negative"
            label="Tentar novamente"
            @click="loadUsers"
        /></template>
      </q-banner>

      <q-card
        v-else-if="companyUsers.length === 0"
        flat
        bordered
        class="empty-state text-center"
      >
        <q-card-section>
          <q-icon name="group" size="54px" color="primary" />
          <h2 class="text-h6 text-weight-bold q-mb-xs"
            >Nenhum usuário encontrado</h2
          >
          <p class="text-grey-7 q-mt-none">{{
            query.search
              ? "Tente alterar sua busca."
              : "Cadastre o primeiro integrante da equipe."
          }}</p>
          <q-btn
            v-if="!query.search"
            unelevated
            no-caps
            rounded
            color="primary"
            icon="person_add"
            label="Cadastrar usuário"
            @click="openCreateDialog"
          />
        </q-card-section>
      </q-card>

      <template v-else>
        <q-table
          flat
          bordered
          hide-bottom
          row-key="id"
          class="users-table gt-xs"
          :rows="companyUsers"
          :columns="columns"
          :rows-per-page-options="[0]"
          @row-click="openUserRow"
        >
          <template #body-cell-user="props">
            <q-td :props="props"
              ><div class="row items-center no-wrap q-gutter-sm"
                ><q-avatar color="purple-1" text-color="primary" size="38px">{{
                  initials(props.row)
                }}</q-avatar
                ><div
                  ><div class="text-weight-medium">{{
                    fullName(props.row)
                  }}</div
                  ><div class="text-caption text-grey-7">{{
                    props.row.user.email
                  }}</div></div
                ></div
              ></q-td
            >
          </template>
          <template #body-cell-phone="props"
            ><q-td :props="props">{{ props.row.user.phone }}</q-td></template
          >
          <template #body-cell-role="props"
            ><q-td :props="props"
              ><div class="row q-gutter-xs"
                ><q-chip
                  v-if="props.row.isOwner"
                  dense
                  color="amber-2"
                  text-color="brown-9"
                  >Dono</q-chip
                ><q-chip
                  v-if="props.row.isAdmin"
                  dense
                  color="purple-1"
                  text-color="primary"
                  >Administrador</q-chip
                ><q-chip
                  v-if="props.row.isProfessional"
                  dense
                  color="blue-1"
                  text-color="info"
                  >Profissional</q-chip
                ></div
              ></q-td
            ></template
          >
          <template #body-cell-status="props"
            ><q-td :props="props"
              ><q-chip
                dense
                :color="
                  props.row.user.isActive && !props.row.user.isBlocked
                    ? 'green-1'
                    : 'red-1'
                "
                :text-color="
                  props.row.user.isActive && !props.row.user.isBlocked
                    ? 'positive'
                    : 'negative'
                "
                >{{
                  props.row.user.isActive && !props.row.user.isBlocked
                    ? "Ativo"
                    : "Inativo"
                }}</q-chip
              ></q-td
            ></template
          >
          <template #body-cell-createdAt="props"
            ><q-td :props="props" class="text-grey-7">{{
              formatDate(props.row.createdAt)
            }}</q-td></template
          >
          <template #body-cell-actions="props"
            ><q-td :props="props"
              ><q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                aria-label="Editar usuário"
                @click.stop="openEditDialog(props.row)"
                ><q-tooltip>Editar</q-tooltip></q-btn
              ><q-btn
                v-if="canDeleteUser(props.row)"
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                aria-label="Excluir usuário"
                @click.stop="openDeleteDialog(props.row)"
                ><q-tooltip>Excluir</q-tooltip></q-btn
              ></q-td
            ></template
          >
        </q-table>

        <div class="users-grid lt-sm">
          <q-card
            v-for="companyUser in companyUsers"
            :key="companyUser.id"
            flat
            bordered
            class="user-card"
          >
            <q-card-section
              ><div class="row items-center no-wrap q-gutter-md"
                ><q-avatar color="purple-1" text-color="primary">{{
                  initials(companyUser)
                }}</q-avatar
                ><div class="col"
                  ><div class="text-subtitle1 text-weight-bold">{{
                    fullName(companyUser)
                  }}</div
                  ><div class="text-caption text-grey-7 ellipsis">{{
                    companyUser.user.email
                  }}</div></div
                ></div
              ><div class="text-body2 text-grey-7 q-mt-md">{{
                companyUser.user.phone
              }}</div
              ><div class="row q-gutter-xs q-mt-sm"
                ><q-chip
                  v-if="companyUser.isOwner"
                  dense
                  color="amber-2"
                  text-color="brown-9"
                  >Dono</q-chip
                ><q-chip
                  v-if="companyUser.isAdmin"
                  dense
                  color="purple-1"
                  text-color="primary"
                  >Admin</q-chip
                ><q-chip
                  v-if="companyUser.isProfessional"
                  dense
                  color="blue-1"
                  text-color="info"
                  >Profissional</q-chip
                ></div
              ><q-separator class="q-my-md" /><div class="row justify-end"
                ><q-btn
                  flat
                  no-caps
                  color="primary"
                  icon="edit"
                  label="Editar"
                  @click="openEditDialog(companyUser)" /><q-btn
                  v-if="canDeleteUser(companyUser)"
                  flat
                  no-caps
                  color="negative"
                  icon="delete_outline"
                  label="Excluir"
                  @click="openDeleteDialog(companyUser)" /></div
            ></q-card-section>
          </q-card>
        </div>

        <div class="row items-center justify-between q-mt-lg pagination-row"
          ><div class="text-caption text-grey-7"
            >{{ meta.totalItems }}
            {{ meta.totalItems === 1 ? "usuário" : "usuários" }}</div
          ><q-pagination
            v-if="meta.totalPages > 1"
            v-model="query.page"
            color="primary"
            boundary-numbers
            :max="meta.totalPages"
            :max-pages="$q.screen.lt.sm ? 4 : 7"
            @update:model-value="loadUsers"
        /></div>
      </template>
    </div>

    <q-dialog v-model="dialogOpen" :persistent="isSaving">
      <q-card class="user-dialog">
        <q-card-section class="row items-start justify-between"
          ><div
            ><div class="text-overline text-primary text-weight-bold">{{
              editingId ? "Editar cadastro" : "Novo cadastro"
            }}</div
            ><div class="text-h5 text-weight-bold">{{
              editingId ? "Editar usuário" : "Adicionar usuário"
            }}</div
            ><div class="text-body2 text-grey-7 q-mt-xs"
              >Defina os dados de acesso e as permissões na empresa.</div
            ></div
          ><q-btn
            flat
            round
            dense
            icon="close"
            :disable="isSaving"
            v-close-popup
        /></q-card-section>
        <q-separator />
        <q-form @submit.prevent="submitUser">
          <q-card-section class="user-form-fields">
            <q-banner
              v-if="mutationError"
              rounded
              class="bg-red-1 text-negative q-mb-md"
              ><template #avatar><q-icon name="error_outline" /></template
              >{{ mutationError }}</q-banner
            >
            <div class="row q-col-gutter-md"
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.firstName"
                  v-bind="fieldProps('firstName')"
                  outlined
                  label="Nome"
                  :rules="[required]"
                  @update:model-value="clearFieldError('firstName')" /></div
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.lastName"
                  v-bind="fieldProps('lastName')"
                  outlined
                  label="Sobrenome"
                  :rules="[required]"
                  @update:model-value="clearFieldError('lastName')" /></div
            ></div>
            <q-input
              v-model="form.email"
              v-bind="fieldProps('email')"
              outlined
              type="email"
              label="E-mail"
              :rules="[required, validEmail]"
              @update:model-value="clearFieldError('email')"
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
                  @update:model-value="clearFieldError('phone')" /></div
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model="form.password"
                  v-bind="fieldProps('password')"
                  outlined
                  :type="showPassword ? 'text' : 'password'"
                  :label="editingId ? 'Nova senha (opcional)' : 'Senha'"
                  :rules="editingId ? [] : [required, minimumPassword]"
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
              ><q-toggle
                v-model="form.isAdmin"
                color="primary"
                label="Administrador" /><q-toggle
                v-model="form.isProfessional"
                color="primary"
                label="Profissional"
            /></div>
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
              :options="serviceOptions"
              :loading="isLoadingServices"
              @update:model-value="onServicesChanged"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md"
            ><q-btn
              flat
              no-caps
              label="Cancelar"
              :disable="isSaving"
              v-close-popup /><q-btn
              type="submit"
              unelevated
              no-caps
              rounded
              color="primary"
              :label="editingId ? 'Salvar alterações' : 'Criar usuário'"
              :loading="isSaving"
          /></q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="deleteDialogOpen"
      :persistent="Boolean(deletingCompanyUserId)"
    >
      <q-card class="delete-dialog">
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <q-avatar color="red-1" text-color="negative" icon="person_remove" />
          <div>
            <div class="text-h6 text-weight-bold">Excluir usuário?</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              <strong>{{ userToDelete ? fullName(userToDelete) : "" }}</strong>
              perderá o acesso à empresa. Esta ação não pode ser desfeita.
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="Boolean(deletingCompanyUserId)"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            rounded
            color="negative"
            label="Excluir usuário"
            :loading="Boolean(deletingCompanyUserId)"
            @click="confirmDeleteUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import {
  useCompanyUsers,
  type CompanyUser,
  type CompanyUserField,
  type CompanyUsersQuery,
  type CreateCompanyUserPayload,
  type UpdateCompanyUserPayload
} from "@/composables/useCompanyUsers";
import { useAuth } from "@/composables/useAuth";
import { useServices } from "@/composables/useServices";
import { useQuasar, type QTableColumn } from "quasar";
import { storeToRefs } from "pinia";
import { computed, onActivated, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const usersApi = useCompanyUsers();
const auth = useAuth();
const { user } = storeToRefs(auth);
const servicesApi = useServices();
const {
  clearFieldError,
  companyUsers,
  deleteCompanyUser,
  deletingCompanyUserId,
  meta,
  isLoading,
  listError,
  mutationError,
  isCreating,
  isUpdating
} = usersApi;
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const userToDelete = ref<CompanyUser | null>(null);
const editingId = ref<string | null>(null);
const showPassword = ref(false);
const servicesDirty = ref(false);
const hasMounted = ref(false);
const isSaving = computed(() => isCreating.value || isUpdating.value);
const serviceOptions = servicesApi.simpleServices;
const isLoadingServices = servicesApi.isLoadingSimpleServices;
const query = reactive<CompanyUsersQuery>({
  page: 1,
  limit: 10,
  search: "",
  sortBy: "user.firstName:ASC"
});
const form = reactive<CreateCompanyUserPayload>(emptyForm());
const sortOptions = [
  { label: "Nome (A–Z)", value: "user.firstName:ASC" },
  { label: "Nome (Z–A)", value: "user.firstName:DESC" },
  { label: "E-mail (A–Z)", value: "user.email:ASC" },
  { label: "Mais recentes", value: "createdAt:DESC" }
];
const columns: QTableColumn[] = [
  {
    name: "user",
    label: "Usuário",
    field: row => row.user.firstName,
    align: "left"
  },
  {
    name: "phone",
    label: "Telefone",
    field: row => row.user.phone,
    align: "left"
  },
  { name: "role", label: "Perfil", field: "isAdmin", align: "left" },
  {
    name: "status",
    label: "Status",
    field: row => row.user.isActive,
    align: "left"
  },
  { name: "createdAt", label: "Cadastro", field: "createdAt", align: "left" },
  { name: "actions", label: "Ações", field: "id", align: "right" }
];
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
async function loadUsers() {
  try {
    await usersApi.listCompanyUsers(query);
  } catch {}
}
function applyFilters() {
  query.page = 1;
  void loadUsers();
}
function openCreateDialog() {
  void router.push("/dashboard/usuarios/novo");
}
function openEditDialog(companyUser: CompanyUser) {
  void router.push(`/dashboard/usuarios/${companyUser.id}`);
}
function openUserRow(_event: Event, companyUser: CompanyUser) {
  openEditDialog(companyUser);
}
function canDeleteUser(companyUser: CompanyUser) {
  if (!user.value || companyUser.isOwner) return false;
  if (user.value.isOwner) return true;
  if (!user.value.isAdmin) return false;
  if (companyUser.userId === user.value.id || companyUser.isAdmin) return false;
  return companyUser.isProfessional;
}
function openDeleteDialog(companyUser: CompanyUser) {
  if (!canDeleteUser(companyUser)) return;
  userToDelete.value = companyUser;
  deleteDialogOpen.value = true;
}
async function confirmDeleteUser() {
  const companyUser = userToDelete.value;
  if (!companyUser || !canDeleteUser(companyUser)) {
    deleteDialogOpen.value = false;
    return;
  }

  try {
    await deleteCompanyUser(companyUser.id);
    deleteDialogOpen.value = false;
    userToDelete.value = null;
    notify("Usuário excluído com sucesso.");
    if (companyUsers.value.length === 1 && query.page > 1) query.page -= 1;
    await loadUsers();
  } catch {
    $q.notify({
      type: "negative",
      position: "top",
      icon: "error_outline",
      message: "Não foi possível excluir o usuário.",
      timeout: 4500
    });
  }
}
function fieldProps(field: CompanyUserField) {
  const message = usersApi.fieldError(field);
  return { error: Boolean(message), errorMessage: message };
}
function onServicesChanged() {
  servicesDirty.value = true;
  usersApi.clearFieldError("services");
}
async function submitUser() {
  try {
    if (editingId.value) {
      const payload: UpdateCompanyUserPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        isAdmin: form.isAdmin,
        isProfessional: form.isProfessional
      };
      if (form.password) payload.password = form.password;
      if (servicesDirty.value) payload.services = form.services;
      await usersApi.updateCompanyUser(editingId.value, payload);
      notify("Usuário atualizado com sucesso.");
    } else {
      await usersApi.createCompanyUser({ ...form });
      query.page = 1;
      notify("Usuário criado com sucesso.");
    }
    dialogOpen.value = false;
    await loadUsers();
  } catch {}
}
function notify(message: string) {
  $q.notify({
    type: "positive",
    position: "top",
    icon: "check_circle",
    message,
    timeout: 3000,
    actions: [{ icon: "close", color: "white", round: true }]
  });
}
function fullName(companyUser: CompanyUser) {
  return `${companyUser.user.firstName} ${companyUser.user.lastName}`;
}
function initials(companyUser: CompanyUser) {
  return `${companyUser.user.firstName[0] ?? ""}${companyUser.user.lastName[0] ?? ""}`.toUpperCase();
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
onMounted(async () => {
  await Promise.allSettled([loadUsers(), servicesApi.listSimpleServices()]);
  hasMounted.value = true;
  if (route.query.refresh === "1") {
    await router.replace({ path: route.path, query: {} });
  }
});
onActivated(async () => {
  if (!hasMounted.value || route.query.refresh !== "1") return;
  await loadUsers();
  await router.replace({ path: route.path, query: {} });
});
</script>

<style scoped>
.users-page {
  background: #faf9fb;
}
.users-content {
  width: 100%;
  max-width: 1180px;
  padding-block: 20px 36px;
}
.new-user-button {
  min-height: 44px;
  padding-inline: 20px;
}
.filters-card,
.users-table,
.user-card,
.empty-state {
  border-radius: 14px;
  border-color: rgb(91 42 110 / 10%);
}
.users-table :deep(th) {
  color: #6f6673;
  font-weight: 600;
  background: #fcfbfd;
}
.users-table :deep(tbody tr) {
  height: 68px;
  cursor: pointer;
}
.users-table :deep(tbody tr:hover) {
  background: rgb(91 42 110 / 3%);
}
.users-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.empty-state {
  padding: 44px 20px;
}
.user-dialog {
  width: min(680px, calc(100vw - 24px));
  border-radius: 18px;
}
.delete-dialog {
  width: min(460px, calc(100vw - 24px));
  border-radius: 18px;
}
.roles-box {
  padding: 12px 14px;
  border: 1px solid rgb(0 0 0 / 12%);
  border-radius: 8px;
}
.user-form-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@media (max-width: 700px) {
  .users-page {
    padding: 16px 12px;
  }
  .users-content {
    padding-block: 8px 24px;
  }
  .page-header {
    gap: 16px;
  }
  .page-header h1 {
    font-size: 1.7rem;
  }
  .new-user-button {
    width: 100%;
  }
  .pagination-row {
    gap: 12px;
    justify-content: center;
  }
}
</style>
