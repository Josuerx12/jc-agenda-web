<template>
  <q-page padding class="form-page">
    <div class="form-content q-mx-auto">
      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Voltar para serviços"
        color="primary"
        class="q-mb-md"
        to="/dashboard/servicos"
      />

      <q-card flat bordered class="form-card">
        <q-card-section class="form-header">
          <div class="text-overline text-primary text-weight-bold">{{
            isEditing ? "Editar cadastro" : "Novo cadastro"
          }}</div>
          <h1 class="text-h4 text-weight-bold q-my-xs">{{
            isEditing ? "Editar serviço" : "Adicionar serviço"
          }}</h1>
          <p class="text-body1 text-grey-7 q-my-none"
            >Essas informações serão exibidas durante o agendamento.</p
          >
        </q-card-section>
        <q-separator />

        <div v-if="isLoading" class="q-pa-lg q-gutter-md"
          ><q-skeleton type="QInput" /><q-skeleton type="QInput" /><q-skeleton
            type="QInput"
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
              @click="loadService" /></template
        ></q-banner>

        <q-form v-else @submit.prevent="submit">
          <q-card-section class="form-fields">
            <q-banner
              v-if="createServiceError"
              rounded
              class="bg-red-1 text-negative q-mb-sm"
              ><template #avatar><q-icon name="error_outline" /></template
              >{{ createServiceError }}</q-banner
            >
            <q-input
              v-model="form.name"
              v-bind="fieldProps('name')"
              outlined
              autofocus
              label="Nome do serviço"
              :rules="[required]"
              @update:model-value="clearCreateServiceFieldError('name')"
            />
            <div class="row q-col-gutter-md"
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model.number="form.price"
                  v-bind="fieldProps('price')"
                  outlined
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="R$"
                  label="Preço"
                  :rules="[requiredNumber, positivePrice]"
                  @update:model-value="
                    clearCreateServiceFieldError('price')
                  " /></div
              ><div class="col-12 col-sm-6"
                ><q-input
                  v-model.number="form.durationInMinutes"
                  v-bind="fieldProps('durationInMinutes')"
                  outlined
                  type="number"
                  min="1"
                  step="1"
                  suffix="min"
                  label="Duração"
                  :rules="[requiredNumber, positiveInteger]"
                  @update:model-value="
                    clearCreateServiceFieldError('durationInMinutes')
                  " /></div
            ></div>
            <q-input
              v-model="form.description"
              v-bind="fieldProps('description')"
              outlined
              type="textarea"
              autogrow
              label="Descrição"
              :rules="[required]"
              @update:model-value="clearCreateServiceFieldError('description')"
            />
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-lg"
            ><q-btn
              flat
              no-caps
              label="Cancelar"
              to="/dashboard/servicos"
              :disable="isSaving" /><q-btn
              type="submit"
              unelevated
              no-caps
              rounded
              color="primary"
              :label="isEditing ? 'Salvar alterações' : 'Criar serviço'"
              :loading="isSaving"
          /></q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {
  useServices,
  type CreateServicePayload,
  type ServiceField
} from "@/composables/useServices";
import { isAxiosError } from "axios";
import { useQuasar } from "quasar";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const servicesApi = useServices();
const id = computed(() =>
  typeof route.params.id === "string" ? route.params.id : null
);
const isEditing = computed(() => Boolean(id.value));
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const form = reactive<CreateServicePayload>({
  name: "",
  price: 0,
  description: "",
  durationInMinutes: 30
});
const isSaving = computed(
  () =>
    servicesApi.isCreatingService.value || servicesApi.isUpdatingService.value
);
const createServiceError = servicesApi.createServiceError;
const clearCreateServiceFieldError = servicesApi.clearCreateServiceFieldError;
const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const requiredNumber = (value: number | null) =>
  value != null || "Campo obrigatório";
const positivePrice = (value: number) =>
  value >= 0 || "Informe um preço válido";
const positiveInteger = (value: number) =>
  (Number.isInteger(value) && value > 0) ||
  "Informe uma duração inteira em minutos";

function fieldProps(field: ServiceField) {
  const message = servicesApi.getCreateServiceFieldError(field);
  return { error: Boolean(message), errorMessage: message };
}
async function loadService() {
  if (!id.value) return;
  isLoading.value = true;
  loadError.value = null;
  try {
    const service = await servicesApi.getService(id.value);
    Object.assign(form, {
      name: service.name,
      price: Number(service.price),
      description: service.description,
      durationInMinutes: service.durationInMinutes
    });
  } catch (error) {
    loadError.value =
      isAxiosError(error) && error.response?.status === 404
        ? "Serviço não encontrado."
        : "Não foi possível carregar o serviço.";
  } finally {
    isLoading.value = false;
  }
}
async function submit() {
  try {
    if (id.value) await servicesApi.updateService(id.value, { ...form });
    else await servicesApi.createService({ ...form });
    $q.notify({
      type: "positive",
      position: "top",
      message: isEditing.value
        ? "Serviço atualizado com sucesso."
        : "Serviço criado com sucesso.",
      timeout: 3000
    });
    await router.push({
      path: "/dashboard/servicos",
      query: { refresh: "1" }
    });
  } catch {}
}
onMounted(() => {
  servicesApi.clearCreateServiceErrors();
  void loadService();
});
</script>

<style scoped>
.form-page {
  background: #faf9fb;
}
.form-content {
  width: 100%;
  max-width: 820px;
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
