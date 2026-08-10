<template>
  <q-page padding class="services-page">
    <div class="services-content q-mx-auto">
      <header class="page-header row items-start justify-between q-mb-lg">
        <div>
          <div class="text-overline text-primary text-weight-bold">
            Catálogo da empresa
          </div>
          <h1 class="text-h4 text-weight-bold q-my-xs">Serviços</h1>
          <p class="text-body1 text-grey-7 q-my-none">
            Cadastre e organize os serviços disponíveis para agendamento.
          </p>
        </div>

        <q-btn
          unelevated
          no-caps
          rounded
          color="primary"
          icon="add"
          label="Novo serviço"
          class="new-service-button"
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
              label="Buscar por nome ou descrição"
              @update:model-value="applyFilters"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-8 col-md-3">
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
          <div class="col-4 col-md-auto">
            <q-btn
              flat
              no-caps
              color="primary"
              icon="tune"
              :label="$q.screen.gt.xs ? 'Filtros' : undefined"
              @click="showFilters = !showFilters"
            />
          </div>
        </q-card-section>

        <q-slide-transition>
          <q-card-section v-show="showFilters" class="filters-expanded">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="query.minimumPrice"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="0.01"
                  label="Preço mínimo"
                  prefix="R$"
                />
              </div>
              <div class="col-6 col-md-3">
                <q-input
                  v-model.number="query.maximumPrice"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="0.01"
                  label="Preço máximo"
                  prefix="R$"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="query.durationInMinutes"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                  label="Duração"
                  :options="durationOptions"
                />
              </div>
              <div class="col-12 col-md-3 row items-center q-gutter-sm">
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  label="Aplicar"
                  @click="applyFilters"
                />
                <q-btn flat no-caps label="Limpar" @click="clearFilters" />
              </div>
            </div>
          </q-card-section>
        </q-slide-transition>
      </q-card>

      <q-markup-table
        v-if="isLoadingServices"
        flat
        bordered
        class="services-table gt-xs"
      >
        <thead>
          <tr>
            <th v-for="column in serviceColumns" :key="column.name">
              <q-skeleton animation="blink" type="text" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="index in 6" :key="index">
            <td v-for="column in serviceColumns" :key="column.name">
              <q-skeleton animation="blink" type="text" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div v-if="isLoadingServices" class="services-grid lt-sm">
        <q-card v-for="index in 4" :key="index" flat bordered>
          <q-card-section>
            <q-skeleton type="text" width="65%" />
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="text" class="q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <q-banner
        v-else-if="servicesError"
        rounded
        class="bg-red-1 text-negative"
      >
        <template #avatar><q-icon name="cloud_off" /></template>
        {{ servicesError }}
        <template #action>
          <q-btn
            flat
            no-caps
            color="negative"
            label="Tentar novamente"
            @click="loadServices"
          />
        </template>
      </q-banner>

      <q-card
        v-else-if="services.length === 0"
        flat
        bordered
        class="empty-state text-center"
      >
        <q-card-section>
          <h2 class="text-h6 text-weight-bold q-mb-xs"
            >Nenhum serviço encontrado</h2
          >
          <p class="text-grey-7 q-mt-none">
            {{
              query.search
                ? "Tente alterar os filtros da busca."
                : "Cadastre o primeiro serviço da empresa."
            }}
          </p>
          <q-btn
            v-if="!query.search"
            unelevated
            no-caps
            rounded
            color="primary"
            icon="add"
            label="Cadastrar serviço"
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
          class="services-table gt-xs"
          :rows="services"
          :columns="serviceColumns"
          :rows-per-page-options="[0]"
          @row-click="openServiceRow"
        >
          <template #body-cell-name="props">
            <q-td :props="props">
              <span class="text-weight-medium">{{ props.row.name }}</span>
            </q-td>
          </template>

          <template #body-cell-description="props">
            <q-td :props="props">
              <div class="table-description text-grey-7">
                {{ props.row.description }}
                <q-tooltip
                  v-if="props.row.description.length > 65"
                  max-width="360px"
                >
                  {{ props.row.description }}
                </q-tooltip>
              </div>
            </q-td>
          </template>

          <template #body-cell-price="props">
            <q-td :props="props" class="text-weight-bold text-primary">
              {{ formatCurrency(props.row.price) }}
            </q-td>
          </template>

          <template #body-cell-durationInMinutes="props">
            <q-td :props="props">
              <q-chip
                dense
                color="purple-1"
                text-color="primary"
                icon="schedule"
              >
                {{ props.row.durationInMinutes }} min
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props" class="text-grey-7">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                aria-label="Editar serviço"
                @click.stop="openEditDialog(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                aria-label="Excluir serviço"
                @click.stop="openDeleteDialog(props.row)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

        <div class="services-grid lt-sm">
          <q-card
            v-for="service in services"
            :key="service.id"
            flat
            bordered
            class="service-card"
          >
            <q-card-section>
              <div class="row items-start justify-between no-wrap">
                <div class="service-icon flex flex-center">
                  <q-icon name="local_offer" color="primary" size="22px" />
                </div>
                <q-chip
                  dense
                  color="purple-1"
                  text-color="primary"
                  icon="schedule"
                >
                  {{ service.durationInMinutes }} min
                </q-chip>
              </div>
              <h2 class="text-h6 text-weight-bold q-mb-xs">{{
                service.name
              }}</h2>
              <p class="service-description text-grey-7 q-mt-none q-mb-lg">
                {{ service.description }}
              </p>
              <div class="row items-end justify-between">
                <div>
                  <div class="text-caption text-grey-6">Valor</div>
                  <div class="text-h6 text-weight-bold text-primary">
                    {{ formatCurrency(service.price) }}
                  </div>
                </div>
                <div class="text-caption text-grey-6">
                  Criado em {{ formatDate(service.createdAt) }}
                </div>
              </div>
              <q-separator class="q-my-md" />
              <div class="row justify-end q-gutter-xs">
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  icon="edit"
                  label="Editar"
                  @click="openEditDialog(service)"
                />
                <q-btn
                  flat
                  no-caps
                  color="negative"
                  icon="delete_outline"
                  label="Excluir"
                  @click="openDeleteDialog(service)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="row items-center justify-between q-mt-lg pagination-row">
          <div class="text-caption text-grey-7">
            {{ meta.totalItems }}
            {{ meta.totalItems === 1 ? "serviço" : "serviços" }}
          </div>
          <q-pagination
            v-if="meta.totalPages > 1"
            v-model="query.page"
            color="primary"
            boundary-numbers
            :max="meta.totalPages"
            :max-pages="$q.screen.lt.sm ? 4 : 7"
            @update:model-value="loadServices"
          />
        </div>
      </template>
    </div>

    <q-dialog v-model="createDialogOpen" :persistent="isSavingService">
      <q-card class="create-dialog">
        <q-card-section class="row items-start justify-between">
          <div>
            <div class="text-overline text-primary text-weight-bold">{{
              editingServiceId ? "Editar cadastro" : "Novo cadastro"
            }}</div>
            <div class="text-h5 text-weight-bold">
              {{ editingServiceId ? "Editar serviço" : "Adicionar serviço" }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Essas informações serão exibidas durante o agendamento.
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="isSavingService"
            v-close-popup
          />
        </q-card-section>

        <q-separator />

        <q-form @submit.prevent="submitService">
          <q-card-section class="q-gutter-sm">
            <q-banner
              v-if="createServiceError"
              rounded
              class="bg-red-1 text-negative q-mb-md"
            >
              <template #avatar><q-icon name="error_outline" /></template>
              {{ createServiceError }}
            </q-banner>

            <q-input
              v-model="serviceForm.name"
              v-bind="serviceFieldError('name')"
              outlined
              autofocus
              label="Nome do serviço"
              :rules="[required]"
              @update:model-value="clearCreateServiceFieldError('name')"
            />
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="serviceForm.price"
                  v-bind="serviceFieldError('price')"
                  outlined
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="R$"
                  label="Preço"
                  :rules="[requiredNumber, positivePrice]"
                  @update:model-value="clearCreateServiceFieldError('price')"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="serviceForm.durationInMinutes"
                  v-bind="serviceFieldError('durationInMinutes')"
                  outlined
                  type="number"
                  min="1"
                  step="1"
                  suffix="min"
                  label="Duração"
                  :rules="[requiredNumber, positiveInteger]"
                  @update:model-value="
                    clearCreateServiceFieldError('durationInMinutes')
                  "
                />
              </div>
            </div>
            <q-input
              v-model="serviceForm.description"
              v-bind="serviceFieldError('description')"
              outlined
              type="textarea"
              autogrow
              label="Descrição"
              :rules="[required]"
              @update:model-value="clearCreateServiceFieldError('description')"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              flat
              no-caps
              label="Cancelar"
              :disable="isSavingService"
              v-close-popup
            />
            <q-btn
              type="submit"
              unelevated
              no-caps
              rounded
              color="primary"
              :label="editingServiceId ? 'Salvar alterações' : 'Criar serviço'"
              :loading="isSavingService"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="deleteDialogOpen"
      :persistent="Boolean(deletingServiceId)"
    >
      <q-card class="delete-dialog">
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <q-avatar color="red-1" text-color="negative" icon="delete_outline" />
          <div>
            <div class="text-h6 text-weight-bold">Excluir serviço?</div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              O serviço <strong>{{ serviceToDelete?.name }}</strong> será
              removido do catálogo da empresa.
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="Boolean(deletingServiceId)"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            rounded
            color="negative"
            label="Excluir serviço"
            :loading="Boolean(deletingServiceId)"
            @click="confirmDeleteService"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import {
  useServices,
  type CompanyService,
  type CreateServicePayload,
  type ServiceField,
  type ServicesQuery
} from "@/composables/useServices";
import { useQuasar, type QTableColumn } from "quasar";
import { computed, onActivated, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const {
  clearCreateServiceErrors,
  clearCreateServiceFieldError,
  createService,
  createServiceError,
  deleteService,
  deletingServiceId,
  getCreateServiceFieldError,
  isCreatingService,
  isUpdatingService,
  isLoadingServices,
  listServices,
  meta,
  services,
  servicesError,
  updateService
} = useServices();

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const createDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingServiceId = ref<string | null>(null);
const serviceToDelete = ref<CompanyService | null>(null);
const isSavingService = computed(
  () => isCreatingService.value || isUpdatingService.value
);
const showFilters = ref(false);
const hasMounted = ref(false);
const query = reactive<ServicesQuery>({
  page: 1,
  limit: 10,
  search: "",
  minimumPrice: null,
  maximumPrice: null,
  durationInMinutes: null,
  sortBy: "name:ASC"
});
const serviceForm = reactive<CreateServicePayload>(emptyServiceForm());

const sortOptions = [
  { label: "Nome (A–Z)", value: "name:ASC" },
  { label: "Nome (Z–A)", value: "name:DESC" },
  { label: "Menor preço", value: "price:ASC" },
  { label: "Maior preço", value: "price:DESC" },
  { label: "Menor duração", value: "durationInMinutes:ASC" },
  { label: "Maior duração", value: "durationInMinutes:DESC" },
  { label: "Mais recentes", value: "createdAt:DESC" }
];
const durationOptions = [15, 20, 30, 45, 60, 90, 120].map(value => ({
  label: `${value} minutos`,
  value
}));
const serviceColumns: QTableColumn[] = [
  {
    name: "name",
    label: "Serviço",
    field: "name",
    align: "left"
  },
  {
    name: "description",
    label: "Descrição",
    field: "description",
    align: "left"
  },
  {
    name: "price",
    label: "Preço",
    field: "price",
    align: "left"
  },
  {
    name: "durationInMinutes",
    label: "Duração",
    field: "durationInMinutes",
    align: "left"
  },
  {
    name: "createdAt",
    label: "Cadastro",
    field: "createdAt",
    align: "left"
  },
  {
    name: "actions",
    label: "Ações",
    field: "id",
    align: "right"
  }
];

const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const requiredNumber = (value: number | null) =>
  value != null || "Campo obrigatório";
const positivePrice = (value: number) =>
  value >= 0 || "Informe um preço válido";
const positiveInteger = (value: number) =>
  (Number.isInteger(value) && value > 0) ||
  "Informe uma duração inteira em minutos";

function emptyServiceForm(): CreateServicePayload {
  return { name: "", price: 0, description: "", durationInMinutes: 30 };
}

async function loadServices() {
  try {
    await listServices(query);
  } catch {
    // O composable disponibiliza o erro para a página.
  }
}

function applyFilters() {
  query.page = 1;
  void loadServices();
}

function clearFilters() {
  query.search = "";
  query.minimumPrice = null;
  query.maximumPrice = null;
  query.durationInMinutes = null;
  query.sortBy = "name:ASC";
  applyFilters();
}

function openCreateDialog() {
  void router.push("/dashboard/servicos/novo");
}

function openEditDialog(service: CompanyService) {
  void router.push(`/dashboard/servicos/${service.id}`);
}

function openServiceRow(_event: Event, service: CompanyService) {
  openEditDialog(service);
}

function openDeleteDialog(service: CompanyService) {
  serviceToDelete.value = service;
  deleteDialogOpen.value = true;
}

function serviceFieldError(field: ServiceField) {
  const errorMessage = getCreateServiceFieldError(field);
  return { error: Boolean(errorMessage), errorMessage };
}

async function submitService() {
  try {
    const wasEditing = Boolean(editingServiceId.value);
    if (editingServiceId.value) {
      await updateService(editingServiceId.value, { ...serviceForm });
    } else {
      await createService({ ...serviceForm });
    }
    createDialogOpen.value = false;
    notifySuccess(
      wasEditing
        ? "Serviço atualizado com sucesso."
        : "Serviço criado com sucesso."
    );
    if (!editingServiceId.value) query.page = 1;
    await loadServices();
  } catch {
    // O composable disponibiliza os erros no formulário.
  }
}

async function confirmDeleteService() {
  if (!serviceToDelete.value) return;

  try {
    await deleteService(serviceToDelete.value.id);
    deleteDialogOpen.value = false;
    serviceToDelete.value = null;
    notifySuccess("Serviço excluído com sucesso.");
    if (services.value.length === 1 && query.page > 1) query.page -= 1;
    await loadServices();
  } catch {
    deleteDialogOpen.value = false;
    serviceToDelete.value = null;
    notifyError("Não foi possível excluir o serviço.");
  }
}

function notifySuccess(message: string) {
  $q.notify({
    type: "positive",
    position: "top",
    icon: "check_circle",
    message,
    timeout: 3000,
    actions: [{ icon: "close", color: "white", round: true }]
  });
}

function notifyError(message: string) {
  $q.notify({
    type: "negative",
    position: "top",
    icon: "error_outline",
    message,
    timeout: 4500,
    actions: [{ icon: "close", color: "white", round: true }]
  });
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

onMounted(async () => {
  await loadServices();
  hasMounted.value = true;
  if (route.query.refresh === "1") {
    await router.replace({ path: route.path, query: {} });
  }
});
onActivated(async () => {
  if (!hasMounted.value || route.query.refresh !== "1") return;
  await loadServices();
  await router.replace({ path: route.path, query: {} });
});
</script>

<style scoped>
.services-page {
  background: #faf9fb;
}
.services-content {
  width: 100%;
  max-width: 1180px;
  padding-block: 20px 36px;
}
.new-service-button {
  min-height: 44px;
  padding-inline: 20px;
}
.filters-card,
.services-table,
.service-card,
.empty-state {
  border-radius: 14px;
  border-color: rgb(91 42 110 / 10%);
}
.filters-expanded {
  border-top: 1px solid rgb(0 0 0 / 7%);
  background: #fcfbfd;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.services-table :deep(th) {
  color: #6f6673;
  font-weight: 600;
  background: #fcfbfd;
}
.services-table :deep(tbody tr) {
  height: 68px;
  cursor: pointer;
}
.services-table :deep(tbody tr:hover) {
  background: rgb(91 42 110 / 3%);
}
.table-description {
  width: clamp(180px, 25vw, 360px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.service-card {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}
.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgb(34 24 39 / 8%);
}
.service-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgb(91 42 110 / 8%);
}
.service-description {
  min-height: 44px;
  line-height: 1.5;
}
.empty-state {
  padding: 44px 20px;
}
.create-dialog {
  width: min(620px, calc(100vw - 24px));
  border-radius: 18px;
}
.delete-dialog {
  width: min(460px, calc(100vw - 24px));
  border-radius: 18px;
}

@media (max-width: 700px) {
  .services-page {
    padding: 16px 12px;
  }
  .services-content {
    padding-block: 8px 24px;
  }
  .page-header {
    gap: 16px;
  }
  .page-header h1 {
    font-size: 1.7rem;
  }
  .new-service-button {
    width: 100%;
  }
  .services-grid {
    grid-template-columns: 1fr;
  }
  .pagination-row {
    gap: 12px;
    justify-content: center;
  }
}
</style>
