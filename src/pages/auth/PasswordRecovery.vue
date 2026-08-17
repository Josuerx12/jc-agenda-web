<template>
  <q-page padding class="recovery-page flex flex-center">
    <q-card flat bordered class="recovery-card row no-wrap">
      <section class="brand-panel column justify-between text-white">
        <div>
          <div class="brand-mark flex flex-center q-mb-lg">
            <q-icon name="calendar_month" size="34px" />
          </div>
          <div class="text-overline text-weight-bold">JC Agenda</div>
          <h1 class="text-h4 text-weight-bold q-my-sm">
            Recupere o acesso à sua conta.
          </h1>
          <p class="text-body1 brand-panel__description">
            Solicite o link de recuperação e defina uma nova senha com
            segurança.
          </p>
        </div>

        <div class="company-badge row items-center no-wrap">
          <q-icon name="business" size="20px" />
          <div class="q-ml-sm">
            <div class="text-caption company-badge__label">Empresa</div>
            <div class="text-subtitle2 text-weight-bold">
              {{ companyDisplayName }}
            </div>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <div class="mobile-brand items-center q-mb-lg">
          <div class="mobile-brand__mark flex flex-center">
            <q-icon name="calendar_month" color="primary" size="26px" />
          </div>
          <div class="q-ml-sm">
            <div class="text-caption text-grey-7">Recuperando acesso</div>
            <div class="text-subtitle1 text-weight-bold">
              {{ companyDisplayName }}
            </div>
          </div>
        </div>

        <div class="q-mb-lg">
          <div class="text-overline text-primary text-weight-bold">
            Recuperação de senha
          </div>
          <h2 class="text-h4 text-weight-bold q-my-xs">
            {{ step === 1 ? "Solicite a recuperação" : "Crie uma nova senha" }}
          </h2>
          <p class="text-body1 text-grey-7 q-my-none">
            {{
              step === 1
                ? "Informe o e-mail usado na sua conta."
                : "Use o token recebido por e-mail para continuar."
            }}
          </p>
        </div>

        <q-stepper
          v-model="step"
          flat
          animated
          color="primary"
          active-color="primary"
          done-color="positive"
          class="recovery-stepper"
        >
          <q-step
            :name="1"
            title="Solicitar"
            icon="mail_outline"
            :done="step > 1"
          >
            <q-form @submit.prevent="submitRequest">
              <q-banner
                v-if="requestError"
                rounded
                class="q-mb-md bg-red-1 text-negative"
              >
                <template #avatar>
                  <q-icon name="error_outline" color="negative" />
                </template>
                {{ requestError }}
              </q-banner>

              <q-input
                v-model="email"
                outlined
                type="email"
                label="E-mail"
                autocomplete="email"
                :rules="[required, validateEmail]"
                @update:model-value="clearRequestError"
              >
                <template #prepend>
                  <q-icon name="mail_outline" />
                </template>
              </q-input>

              <q-btn
                type="submit"
                unelevated
                no-caps
                rounded
                color="primary"
                label="Enviar solicitação"
                icon-right="arrow_forward"
                :loading="isRequesting"
                class="full-width action-button q-mt-sm"
              />
            </q-form>
          </q-step>

          <q-step :name="2" title="Redefinir" icon="lock_reset">
            <q-banner
              v-if="requestSent && !resetSucceeded"
              rounded
              class="q-mb-md bg-green-1 text-positive"
            >
              <template #avatar>
                <q-icon name="mark_email_read" color="positive" />
              </template>
              Solicitação enviada. Confira seu e-mail para obter o token.
            </q-banner>

            <q-banner
              v-if="requestSent && requestError && !resetSucceeded"
              rounded
              class="q-mb-md bg-red-1 text-negative"
            >
              <template #avatar>
                <q-icon name="error_outline" color="negative" />
              </template>
              {{ requestError }}
            </q-banner>

            <q-btn
              v-if="requestSent && !resetSucceeded"
              outline
              no-caps
              rounded
              color="primary"
              icon="refresh"
              :label="resendButtonLabel"
              :disable="resendCooldown > 0"
              :loading="isRequesting"
              class="full-width q-mb-md"
              @click="resendRecoveryCode"
            />

            <q-banner
              v-if="resetSucceeded"
              rounded
              class="q-mb-md bg-green-1 text-positive"
            >
              <template #avatar>
                <q-icon name="check_circle_outline" color="positive" />
              </template>
              Senha redefinida com sucesso. Você já pode entrar na sua conta.
            </q-banner>

            <q-form v-if="!resetSucceeded" @submit.prevent="submitReset">
              <q-banner
                v-if="resetError"
                rounded
                class="q-mb-md bg-red-1 text-negative"
              >
                <template #avatar>
                  <q-icon name="error_outline" color="negative" />
                </template>
                {{ resetError }}
              </q-banner>

              <q-input
                v-model="resetForm.token"
                outlined
                label="Token de recuperação"
                autocomplete="one-time-code"
                :rules="[required]"
                @update:model-value="clearResetError"
              >
                <template #prepend>
                  <q-icon name="key" />
                </template>
              </q-input>

              <q-input
                v-model="resetForm.password"
                outlined
                :type="showPassword ? 'text' : 'password'"
                label="Nova senha"
                autocomplete="new-password"
                hint="Use pelo menos 8 caracteres."
                :rules="[required, validatePassword]"
                @update:model-value="clearResetError"
              >
                <template #prepend>
                  <q-icon name="lock_outline" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    :aria-label="
                      showPassword ? 'Ocultar senha' : 'Exibir senha'
                    "
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-input
                v-model="resetForm.passwordConfirmation"
                outlined
                :type="showPasswordConfirmation ? 'text' : 'password'"
                label="Confirme a nova senha"
                autocomplete="new-password"
                :rules="[required, validatePasswordConfirmation]"
                @update:model-value="clearResetError"
              >
                <template #prepend>
                  <q-icon name="lock_outline" />
                </template>
                <template #append>
                  <q-icon
                    :name="
                      showPasswordConfirmation ? 'visibility_off' : 'visibility'
                    "
                    class="cursor-pointer"
                    :aria-label="
                      showPasswordConfirmation
                        ? 'Ocultar confirmação de senha'
                        : 'Exibir confirmação de senha'
                    "
                    @click="
                      showPasswordConfirmation = !showPasswordConfirmation
                    "
                  />
                </template>
              </q-input>

              <div class="row items-center q-col-gutter-sm q-mt-sm">
                <div class="col-auto">
                  <q-btn
                    flat
                    no-caps
                    rounded
                    color="grey-7"
                    label="Voltar"
                    icon="arrow_back"
                    :disable="
                      isResetting || requestSent || Boolean(tokenFromUrl)
                    "
                    @click="step = 1"
                  />
                </div>
                <div class="col">
                  <q-btn
                    type="submit"
                    unelevated
                    no-caps
                    rounded
                    color="primary"
                    label="Redefinir senha"
                    icon-right="check"
                    :loading="isResetting"
                    class="full-width action-button"
                  />
                </div>
              </div>
            </q-form>

            <q-btn
              v-else
              unelevated
              no-caps
              rounded
              color="primary"
              label="Ir para o login"
              icon-right="login"
              to="/login"
              class="full-width action-button"
            />
          </q-step>
        </q-stepper>

        <div class="back-to-login row items-center justify-center q-mt-lg">
          <q-icon name="arrow_back" size="17px" />
          <router-link to="/login" class="q-ml-xs text-primary">
            Voltar para o login
          </router-link>
        </div>
      </section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useCompany } from "@/composables/useCompany";
import { usePasswordRecovery } from "@/composables/usePasswordRecovery";
import { computed, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";

const RESEND_COOLDOWN_SECONDS = 60;

const company = useCompany();
const route = useRoute();
const tokenFromUrl = Array.isArray(route.query.token)
  ? route.query.token[0]
  : route.query.token;

const step = ref(tokenFromUrl ? 2 : 1);
const email = ref("");
const requestSent = ref(false);
const resendCooldown = ref(0);
const resetSucceeded = ref(false);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const resetForm = ref({
  token: tokenFromUrl ?? "",
  password: "",
  passwordConfirmation: ""
});
let resendTimer: number | undefined;

const {
  clearRequestError,
  clearResetError,
  isRequesting,
  isResetting,
  requestError,
  requestPasswordRecovery,
  resetError,
  resetPassword
} = usePasswordRecovery();

const companyDisplayName = computed(
  () => company.trandingName || company.companyName || "Sua empresa"
);
const resendButtonLabel = computed(() =>
  resendCooldown.value > 0
    ? `Reenviar código em ${resendCooldown.value}s`
    : "Reenviar código"
);

const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const validateEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Informe um e-mail válido";
const validatePassword = (value: string) =>
  value.length >= 8 || "A senha deve ter pelo menos 8 caracteres";
const validatePasswordConfirmation = (value: string) =>
  value === resetForm.value.password || "As senhas não coincidem";

function startResendCooldown() {
  window.clearInterval(resendTimer);
  resendCooldown.value = RESEND_COOLDOWN_SECONDS;

  resendTimer = window.setInterval(() => {
    resendCooldown.value -= 1;

    if (resendCooldown.value <= 0) {
      window.clearInterval(resendTimer);
      resendTimer = undefined;
    }
  }, 1000);
}

async function submitRequest() {
  try {
    await requestPasswordRecovery({ email: email.value.trim() });
    requestSent.value = true;
    step.value = 2;
    startResendCooldown();
  } catch {
    // A mensagem da API é exibida no formulário.
  }
}

async function resendRecoveryCode() {
  if (resendCooldown.value > 0 || isRequesting.value) return;

  try {
    await requestPasswordRecovery({ email: email.value.trim() });
    startResendCooldown();
  } catch {
    // A mensagem da API é exibida no formulário.
  }
}

async function submitReset() {
  try {
    await resetPassword({
      token: resetForm.value.token.trim(),
      password: resetForm.value.password
    });
    resetSucceeded.value = true;
  } catch {
    // A mensagem da API é exibida no formulário.
  }
}

onBeforeUnmount(() => window.clearInterval(resendTimer));
</script>

<style scoped>
.recovery-page {
  min-height: inherit;
  background:
    radial-gradient(circle at 15% 20%, rgb(181 101 118 / 12%), transparent 30%),
    linear-gradient(145deg, #faf9fb 0%, #f3eff5 100%);
}

.recovery-card {
  width: 100%;
  max-width: 940px;
  min-height: 620px;
  overflow: hidden;
  border-radius: 20px;
  border-color: rgb(91 42 110 / 12%);
  box-shadow: 0 20px 55px rgb(34 24 39 / 12%);
}

.brand-panel {
  width: 43%;
  padding: 52px 44px;
  background:
    radial-gradient(circle at 85% 15%, rgb(214 179 106 / 24%), transparent 28%),
    linear-gradient(145deg, #6b347e 0%, var(--q-primary) 55%, #41204e 100%);
}

.brand-mark,
.mobile-brand__mark {
  width: 58px;
  height: 58px;
  border-radius: 16px;
}

.brand-mark {
  background: rgb(255 255 255 / 13%);
  border: 1px solid rgb(255 255 255 / 18%);
}

.brand-panel__description {
  max-width: 310px;
  color: rgb(255 255 255 / 75%);
  line-height: 1.65;
}

.company-badge {
  padding: 14px 16px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 12px;
  background: rgb(255 255 255 / 9%);
}

.company-badge__label {
  color: rgb(255 255 255 / 65%);
}

.form-panel {
  width: 57%;
  padding: 42px 52px;
  background: #fff;
}

.mobile-brand {
  display: none;
}

.mobile-brand__mark {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgb(91 42 110 / 8%);
}

.recovery-stepper {
  box-shadow: none;
}

.recovery-stepper :deep(.q-stepper__header) {
  margin-bottom: 12px;
  border: 1px solid rgb(91 42 110 / 10%);
  border-radius: 12px;
  box-shadow: none;
}

.recovery-stepper :deep(.q-stepper__tab) {
  min-height: 68px;
  padding: 12px 16px;
}

.recovery-stepper :deep(.q-stepper__step-inner) {
  padding: 14px 0 0;
}

.action-button {
  min-height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.back-to-login {
  color: #7c7480;
  font-size: 0.85rem;
}

.back-to-login a {
  font-weight: 500;
  text-decoration: none;
}

@media (max-width: 760px) {
  .recovery-page {
    padding: 16px 12px;
    align-items: flex-start;
  }

  .recovery-card {
    max-width: 520px;
    min-height: auto;
    margin-block: 16px;
    border-radius: 16px;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    width: 100%;
    padding: 32px 24px;
  }

  .mobile-brand {
    display: flex;
  }
}

@media (max-width: 420px) {
  .form-panel {
    padding: 28px 18px;
  }

  .form-panel h2 {
    font-size: 1.7rem;
  }

  .recovery-stepper :deep(.q-stepper__label) {
    display: none;
  }
}
</style>
