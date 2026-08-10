<template>
  <q-page padding class="login-page flex flex-center">
    <q-card flat bordered class="login-card row no-wrap">
      <section class="brand-panel column justify-between text-white">
        <div>
          <div class="brand-mark flex flex-center q-mb-lg">
            <q-icon name="calendar_month" size="34px" />
          </div>
          <div class="text-overline text-weight-bold">JC Agenda</div>
          <h1 class="text-h4 text-weight-bold q-my-sm">
            Organize seu negócio com simplicidade.
          </h1>
          <p class="text-body1 brand-panel__description">
            Acesse sua agenda, equipe e atendimentos em um só lugar.
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
            <div class="text-caption text-grey-7">Acessando</div>
            <div class="text-subtitle1 text-weight-bold">
              {{ companyDisplayName }}
            </div>
          </div>
        </div>

        <div class="q-mb-xl">
          <div class="text-overline text-primary text-weight-bold">
            Bem-vindo de volta
          </div>
          <h2 class="text-h4 text-weight-bold q-my-xs">Entre na sua conta</h2>
          <p class="text-body1 text-grey-7 q-my-none">
            Informe seus dados para continuar.
          </p>
        </div>

        <q-form class="login-form" @submit.prevent="submitLogin">
          <q-banner
            v-if="authError"
            rounded
            class="q-mb-sm bg-red-1 text-negative"
          >
            <template #avatar>
              <q-icon name="error_outline" color="negative" />
            </template>
            {{ authError }}
          </q-banner>

          <q-input
            v-model="form.email"
            outlined
            type="email"
            label="E-mail"
            autocomplete="email"
            :rules="[required, validateEmail]"
          >
            <template #prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            autocomplete="current-password"
            :rules="[required]"
          >
            <template #prepend>
              <q-icon name="lock_outline" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                :aria-label="showPassword ? 'Ocultar senha' : 'Exibir senha'"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row items-center justify-between q-mb-md">
            <q-checkbox
              v-model="form.rememberMe"
              dense
              label="Manter conectado"
              color="primary"
            />
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              label="Esqueci minha senha"
              class="forgot-password"
            />
          </div>

          <q-btn
            type="submit"
            unelevated
            no-caps
            rounded
            color="primary"
            label="Entrar"
            icon-right="arrow_forward"
            :loading="isAuthenticating"
            class="full-width login-button"
          />
        </q-form>

        <div class="security-note row items-center justify-center q-mt-lg">
          <q-icon name="verified_user" size="17px" />
          <span class="q-ml-xs">Seus dados são protegidos com segurança.</span>
        </div>
      </section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useAuth } from "@/composables/useAuth";
import { useCompany } from "@/composables/useCompany";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const auth = useAuth();
const company = useCompany();
const router = useRouter();
const { authError, isAuthenticating } = storeToRefs(auth);
const showPassword = ref(false);

const companyDisplayName = computed(
  () => company.trandingName || company.companyName || "Sua empresa"
);

const form = ref({
  email: "",
  password: "",
  rememberMe: false
});

const required = (value: string) =>
  Boolean(value?.trim()) || "Campo obrigatório";
const validateEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Informe um e-mail válido";

async function submitLogin() {
  try {
    await auth.signIn(
      {
        email: form.value.email,
        password: form.value.password
      },
      company.id,
      form.value.rememberMe
    );
    await router.replace("/dashboard");
  } catch {
    // O store de autenticação disponibiliza a mensagem no formulário.
  }
}
</script>

<style scoped>
.login-page {
  min-height: inherit;
  background:
    radial-gradient(circle at 15% 20%, rgb(181 101 118 / 12%), transparent 30%),
    linear-gradient(145deg, #faf9fb 0%, #f3eff5 100%);
}

.login-card {
  width: 100%;
  max-width: 940px;
  min-height: 590px;
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
  padding: 58px 64px;
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

.login-form {
  display: grid;
  gap: 6px;
}

.login-button {
  min-height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.forgot-password {
  font-weight: 500;
}

.security-note {
  color: #7c7480;
  font-size: 0.8rem;
}

@media (max-width: 760px) {
  .login-page {
    padding: 16px 12px;
    align-items: flex-start;
  }

  .login-card {
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

  .forgot-password {
    margin-left: auto;
    font-size: 0.78rem;
  }
}
</style>
