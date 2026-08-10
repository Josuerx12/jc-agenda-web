<template>
  <q-layout view="lHh lpR fFf">
    <q-header reveal elevated class="bg-primary q-pa-md text-white">
      <q-toolbar>
        <q-toolbar-title>
          <AppBrand />
        </q-toolbar-title>

        <div class="auth-actions row items-center no-wrap">
          <q-btn
            v-if="accessMode === 'login'"
            flat
            no-caps
            rounded
            class="auth-button auth-button--login"
            label="Entrar"
            to="/login"
          />
          <q-btn
            v-if="accessMode === 'registration'"
            unelevated
            no-caps
            rounded
            class="auth-button auth-button--register"
            label="Criar conta"
            to="/cadastro"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container v-if="accessMode !== 'loading'">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import AppBrand from "@/components/AppBrand.vue";
import { useCompany } from "@/composables/useCompany";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const ROOT_DOMAIN = "jcagenda.com.br";

const company = useCompany();
const router = useRouter();
const accessMode = ref<"loading" | "login" | "registration">("loading");

function getCompanySlug(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");

  if (
    normalizedHostname === ROOT_DOMAIN ||
    normalizedHostname === `www.${ROOT_DOMAIN}` ||
    normalizedHostname === "localhost" ||
    normalizedHostname === "127.0.0.1"
  ) {
    return null;
  }

  const productionSuffix = `.${ROOT_DOMAIN}`;
  if (normalizedHostname.endsWith(productionSuffix)) {
    const slug = normalizedHostname.slice(0, -productionSuffix.length);
    return slug && !slug.includes(".") ? slug : null;
  }

  const localhostSuffix = ".localhost";
  if (normalizedHostname.endsWith(localhostSuffix)) {
    const slug = normalizedHostname.slice(0, -localhostSuffix.length);
    return slug && !slug.includes(".") ? slug : null;
  }

  return null;
}

function getMainDomainRegistrationUrl() {
  const url = new URL(window.location.href);

  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".localhost")
  ) {
    url.hostname = "localhost";
  } else {
    url.hostname = ROOT_DOMAIN;
    url.port = "";
  }

  url.pathname = "/cadastro";
  url.search = "";
  url.hash = "";

  return url.toString();
}

onMounted(async () => {
  const slug = getCompanySlug(window.location.hostname);

  if (!slug) {
    accessMode.value = "registration";

    if (router.currentRoute.value.path === "/login") {
      await router.replace("/cadastro");
    }

    return;
  }

  try {
    await company.resolveCompany(slug);
    accessMode.value = "login";

    if (router.currentRoute.value.path === "/cadastro") {
      await router.replace("/login");
    }
  } catch {
    window.location.replace(getMainDomainRegistrationUrl());
  }
});
</script>

<style scoped>
.auth-button {
  min-height: 40px;
  padding-inline: 18px;
  font-weight: 500;
  letter-spacing: 0;
}

.auth-button--login {
  color: rgb(255 255 255 / 88%);
}

.auth-button--login:hover {
  color: #fff;
  background: rgb(255 255 255 / 10%);
}

.auth-button--register {
  color: var(--q-primary);
  background: #fff;
  box-shadow: 0 4px 12px rgb(9 39 87 / 18%);
}

.auth-button--register:hover {
  background: #f7f9ff;
  box-shadow: 0 6px 16px rgb(9 39 87 / 24%);
}

@media (max-width: 480px) {
  .auth-actions {
    gap: 4px;
  }

  .auth-button {
    min-height: 38px;
    padding-inline: 13px;
  }
}
</style>
