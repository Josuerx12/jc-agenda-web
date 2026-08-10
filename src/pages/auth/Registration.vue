<template>
  <q-page padding class="registration-page">
    <div class="registration-content q-mx-auto">
      <div class="q-mb-lg">
        <div class="text-overline text-primary text-weight-bold">
          Comece agora
        </div>
        <h1 class="text-h4 text-weight-bold q-my-xs">Cadastre sua empresa</h1>
        <p class="text-body1 text-grey-7 q-my-none">
          Preencha os dados abaixo para criar seu espaço no JC Agenda.
        </p>
      </div>

      <q-banner
        v-if="registrationError"
        rounded
        class="q-mb-md bg-red-1 text-negative"
      >
        <template #avatar>
          <q-icon name="error_outline" color="negative" />
        </template>
        {{ registrationError }}
      </q-banner>

      <q-stepper
        v-model="step"
        animated
        flat
        bordered
        color="primary"
        active-color="primary"
        done-color="positive"
        class="registration-stepper"
        :vertical="$q.screen.lt.sm"
      >
        <q-step
          :name="1"
          title="Empresa"
          caption="Dados principais"
          icon="business"
          :done="step > 1"
        >
          <q-form ref="companyForm" class="form-grid" @submit.prevent>
            <q-input
              v-model="form.company.corporateName"
              v-bind="serverError('company.corporateName')"
              @update:model-value="
                clearRegistrationFieldError('company.corporateName')
              "
              outlined
              label="Razão social"
              autocomplete="organization"
              :rules="[required]"
            />
            <q-input
              v-model="form.company.trandingName"
              v-bind="serverError('company.trandingName')"
              @update:model-value="
                clearRegistrationFieldError('company.trandingName')
              "
              outlined
              label="Nome fantasia"
              :rules="[required]"
            />
            <q-input
              v-model="form.company.cnpj"
              v-bind="serverError('company.cnpj')"
              @update:model-value="clearRegistrationFieldError('company.cnpj')"
              outlined
              label="CNPJ"
              mask="##.###.###/####-##"
              unmasked-value
              :rules="[required, validateCnpj]"
            />
            <q-input
              v-model="form.company.slug"
              v-bind="serverError('company.slug')"
              outlined
              label="Endereço da empresa"
              hint="Use apenas letras minúsculas, números e hífen."
              prefix="https://"
              suffix=".jcagenda.com.br"
              :rules="[required, validateSlug]"
              @update:model-value="normalizeSlug"
            />
            <q-input
              v-model="form.company.email"
              v-bind="serverError('company.email')"
              @update:model-value="clearRegistrationFieldError('company.email')"
              outlined
              type="email"
              label="E-mail comercial"
              autocomplete="email"
              :rules="[required, validateEmail]"
            />
            <q-input
              v-model="form.company.phone"
              v-bind="serverError('company.phone')"
              @update:model-value="clearRegistrationFieldError('company.phone')"
              outlined
              type="tel"
              label="Telefone"
              mask="(##) #####-####"
              unmasked-value
              autocomplete="tel"
              :rules="[required, validatePhone]"
            />
            <q-input
              v-model="form.company.additionalPhone"
              v-bind="serverError('company.additionalPhone')"
              @update:model-value="
                clearRegistrationFieldError('company.additionalPhone')
              "
              outlined
              type="tel"
              label="Telefone adicional"
              mask="(##) #####-####"
              unmasked-value
              class="field-full"
            />

            <q-stepper-navigation class="field-full navigation-actions">
              <q-btn
                color="primary"
                no-caps
                rounded
                label="Continuar"
                icon-right="arrow_forward"
                @click="goToNextStep(companyForm, 2)"
              />
            </q-stepper-navigation>
          </q-form>
        </q-step>

        <q-step
          :name="2"
          title="Endereço"
          caption="Localização"
          icon="location_on"
          :done="step > 2"
        >
          <q-form ref="addressForm" class="form-grid" @submit.prevent>
            <q-input
              v-model="form.company.address.zipCode"
              outlined
              label="CEP"
              mask="#####-###"
              unmasked-value
              :loading="isLoadingAddress"
              :error="
                Boolean(
                  addressError ||
                  getRegistrationFieldError('company.address.zipCode')
                )
              "
              :error-message="
                addressError ??
                getRegistrationFieldError('company.address.zipCode')
              "
              :rules="[required, validateZipCode]"
              @blur="lookupAddress()"
              @update:model-value="handleZipCodeInput"
            >
              <template #append>
                <q-icon
                  name="search"
                  class="cursor-pointer"
                  role="button"
                  aria-label="Consultar CEP"
                  @click="lookupAddress(true)"
                />
              </template>
            </q-input>
            <q-input
              v-model="form.company.address.address"
              v-bind="serverError('company.address.address')"
              @update:model-value="
                clearRegistrationFieldError('company.address.address')
              "
              outlined
              label="Logradouro"
              autocomplete="street-address"
              :rules="[required]"
            />
            <q-input
              v-model="form.company.address.number"
              v-bind="serverError('company.address.number')"
              @update:model-value="
                clearRegistrationFieldError('company.address.number')
              "
              outlined
              label="Número"
              :rules="[required]"
            />
            <q-input
              v-model="form.company.address.complement"
              v-bind="serverError('company.address.complement')"
              @update:model-value="
                clearRegistrationFieldError('company.address.complement')
              "
              outlined
              label="Complemento"
            />
            <q-input
              v-model="form.company.address.neighborhood"
              v-bind="serverError('company.address.neighborhood')"
              @update:model-value="
                clearRegistrationFieldError('company.address.neighborhood')
              "
              outlined
              label="Bairro"
              :rules="[required]"
            />
            <q-input
              v-model="form.company.address.city"
              v-bind="serverError('company.address.city')"
              @update:model-value="
                clearRegistrationFieldError('company.address.city')
              "
              outlined
              label="Cidade"
              autocomplete="address-level2"
              :rules="[required]"
            />
            <q-select
              v-model="form.company.address.state"
              v-bind="serverError('company.address.state')"
              @update:model-value="
                clearRegistrationFieldError('company.address.state')
              "
              outlined
              label="Estado"
              :options="states"
              emit-value
              map-options
              autocomplete="address-level1"
              class="field-full"
              :rules="[required]"
            />

            <q-stepper-navigation class="field-full navigation-actions">
              <q-btn
                flat
                no-caps
                rounded
                color="grey-7"
                label="Voltar"
                icon="arrow_back"
                @click="step = 1"
              />
              <q-btn
                color="primary"
                no-caps
                rounded
                label="Continuar"
                icon-right="arrow_forward"
                @click="goToNextStep(addressForm, 3)"
              />
            </q-stepper-navigation>
          </q-form>
        </q-step>

        <q-step
          :name="3"
          title="Usuário"
          caption="Dados de acesso"
          icon="person"
        >
          <q-form
            ref="userForm"
            class="form-grid"
            @submit.prevent="submitRegistration"
          >
            <q-input
              v-model="form.user.firstName"
              v-bind="serverError('user.firstName')"
              @update:model-value="
                clearRegistrationFieldError('user.firstName')
              "
              outlined
              label="Nome"
              autocomplete="given-name"
              :rules="[required]"
            />
            <q-input
              v-model="form.user.lastName"
              v-bind="serverError('user.lastName')"
              @update:model-value="clearRegistrationFieldError('user.lastName')"
              outlined
              label="Sobrenome"
              autocomplete="family-name"
              :rules="[required]"
            />
            <q-input
              v-model="form.user.email"
              v-bind="serverError('user.email')"
              @update:model-value="clearRegistrationFieldError('user.email')"
              outlined
              type="email"
              label="E-mail de acesso"
              autocomplete="email"
              :rules="[required, validateEmail]"
            />
            <q-input
              v-model="form.user.phone"
              v-bind="serverError('user.phone')"
              @update:model-value="clearRegistrationFieldError('user.phone')"
              outlined
              type="tel"
              label="Telefone"
              mask="(##) #####-####"
              unmasked-value
              autocomplete="tel"
              :rules="[required, validatePhone]"
            />
            <q-input
              v-model="form.user.password"
              v-bind="serverError('user.password')"
              @update:model-value="clearRegistrationFieldError('user.password')"
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Senha"
              autocomplete="new-password"
              hint="Use pelo menos 8 caracteres."
              class="field-full"
              :rules="[required, validatePassword]"
            >
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-stepper-navigation class="field-full navigation-actions">
              <q-btn
                flat
                no-caps
                rounded
                color="grey-7"
                label="Voltar"
                icon="arrow_back"
                :disable="isRegistering"
                @click="step = 2"
              />
              <q-btn
                type="submit"
                color="primary"
                no-caps
                rounded
                label="Finalizar cadastro"
                icon-right="check"
                :loading="isRegistering"
              />
            </q-stepper-navigation>
          </q-form>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useAddress } from "@/composables/useAddress";
import {
  useRegistration,
  type RegistrationFieldPath,
  type RegistrationPayload
} from "@/composables/useRegistration";
import type { QForm } from "quasar";
import { ref } from "vue";

const step = ref(1);
const showPassword = ref(false);
const companyForm = ref<QForm | null>(null);
const addressForm = ref<QForm | null>(null);
const userForm = ref<QForm | null>(null);
const {
  addressError,
  clearAddressError,
  findAddressByZipCode,
  isLoadingAddress
} = useAddress();
const {
  clearRegistrationFieldError,
  getRegistrationFieldError,
  isRegistering,
  register,
  registrationError,
  registrationFieldErrors
} = useRegistration();
let lastRequestedZipCode = "";

const form = ref<RegistrationPayload>({
  user: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  },
  company: {
    cnpj: "",
    trandingName: "",
    corporateName: "",
    slug: "",
    email: "",
    phone: "",
    additionalPhone: "",
    address: {
      zipCode: "",
      city: "",
      state: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: ""
    }
  }
});

const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO"
];

const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const validateEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Informe um e-mail válido";
const validateCnpj = (value: string) =>
  value.length === 14 || "Informe os 14 números do CNPJ";
const validatePhone = (value: string) =>
  value.length >= 10 || "Informe um telefone válido";
const validateZipCode = (value: string) =>
  value.length === 8 || "Informe um CEP válido";
const validatePassword = (value: string) =>
  value.length >= 8 || "A senha deve ter pelo menos 8 caracteres";
const validateSlug = (value: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
  "Use letras minúsculas, números e hífen";

function normalizeSlug(value: string | number | null) {
  clearRegistrationFieldError("company.slug");
  form.value.company.slug = String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "");
}

function handleZipCodeInput(value: string | number | null) {
  clearAddressError();
  clearRegistrationFieldError("company.address.zipCode");

  if (String(value ?? "").replace(/\D/g, "").length === 8) {
    void lookupAddress();
  }
}

function serverError(field: RegistrationFieldPath) {
  const errorMessage = getRegistrationFieldError(field);

  return {
    error: Boolean(errorMessage),
    errorMessage
  };
}

async function lookupAddress(force = false) {
  const zipCode = form.value.company.address.zipCode.replace(/\D/g, "");

  if (
    zipCode.length !== 8 ||
    isLoadingAddress.value ||
    (!force && zipCode === lastRequestedZipCode)
  ) {
    return;
  }

  lastRequestedZipCode = zipCode;

  try {
    const address = await findAddressByZipCode(zipCode);

    if (form.value.company.address.zipCode.replace(/\D/g, "") !== zipCode) {
      return;
    }

    form.value.company.address.zipCode = address.zipCode;
    form.value.company.address.address = address.street;
    form.value.company.address.complement = address.complement ?? "";
    form.value.company.address.neighborhood = address.neighborhood;
    form.value.company.address.city = address.city.name;
    form.value.company.address.state = address.state.code;
  } catch {
    // O composable disponibiliza a mensagem de erro para o campo de CEP.
  }
}

async function goToNextStep(currentForm: QForm | null, nextStep: number) {
  if (await currentForm?.validate()) {
    step.value = nextStep;
  }
}

function getCompanyLoginUrl(slug: string) {
  const url = new URL(window.location.href);

  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost")
  ) {
    url.hostname = `${slug}.localhost`;
  } else {
    url.hostname = `${slug}.jcagenda.com.br`;
    url.port = "";
  }

  url.pathname = "/login";
  url.search = "";
  url.hash = "";

  return url.toString();
}

async function submitRegistration() {
  try {
    await register(form.value);
    window.location.assign(getCompanyLoginUrl(form.value.company.slug));
  } catch {
    const fields = Object.keys(registrationFieldErrors.value);

    if (fields.some(field => field.startsWith("company.address."))) {
      step.value = 2;
    } else if (fields.some(field => field.startsWith("company."))) {
      step.value = 1;
    } else {
      step.value = 3;
    }
  }
}
</script>

<style scoped>
.registration-page {
  background: #faf9fb;
}

.registration-content {
  width: 100%;
  max-width: 920px;
  padding-block: 32px;
}

.registration-stepper {
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgb(34 24 39 / 7%);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
}

.field-full {
  grid-column: 1 / -1;
}

.navigation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 700px) {
  .registration-page {
    padding: 16px 12px;
  }

  .registration-content {
    padding-block: 8px 24px;
  }

  .registration-content h1 {
    font-size: 1.65rem;
    line-height: 1.25;
  }

  .registration-stepper {
    border-radius: 12px;
    box-shadow: 0 6px 20px rgb(34 24 39 / 6%);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: auto;
  }

  .navigation-actions {
    justify-content: space-between;
    gap: 6px;
    margin-top: 4px;
  }

  .navigation-actions :deep(.q-btn) {
    flex: 1;
  }
}
</style>
