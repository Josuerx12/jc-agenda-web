<template>
  <q-layout view="lHh lpR fFf">
    <q-header reveal elevated class="bg-primary q-pa-md text-white">
      <q-toolbar>
        <q-toolbar-title>
          <AppBrand />
        </q-toolbar-title>

        <div v-if="user" class="row items-center no-wrap q-gutter-sm">
          <div class="user-summary text-right gt-xs">
            <div class="text-subtitle2 text-weight-medium">
              {{ user.firstName }} {{ user.lastName }}
            </div>
            <div class="text-caption user-summary__email">{{ user.email }}</div>
          </div>

          <q-avatar color="white" text-color="primary" size="38px">
            {{ userInitials }}
          </q-avatar>

          <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" elevated>
      <q-list padding>
        <q-item v-if="user">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ userInitials }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label
              >{{ user.firstName }} {{ user.lastName }}</q-item-label
            >
            <q-item-label caption>{{ user.email }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple to="/dashboard" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Visão geral</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="canManageServices"
          clickable
          v-ripple
          to="/dashboard/servicos"
        >
          <q-item-section avatar>
            <q-icon name="local_offer" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Serviços</q-item-label>
            <q-item-label caption>Catálogo da empresa</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="canManageServices"
          clickable
          v-ripple
          to="/dashboard/usuarios"
        >
          <q-item-section avatar>
            <q-icon name="group" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Usuários</q-item-label>
            <q-item-label caption>Equipe e permissões</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Sair</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <keep-alive include="ServicesPage,CompanyUsersPage">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import AppBrand from "@/components/AppBrand.vue";
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const auth = useAuth();
const router = useRouter();
const { user } = storeToRefs(auth);
const rightDrawerOpen = ref(false);
const canManageServices = computed(
  () => Boolean(user.value?.isAdmin) || Boolean(user.value?.isOwner)
);
const userInitials = computed(() => {
  if (!user.value) return "";
  return `${user.value.firstName[0] ?? ""}${user.value.lastName[0] ?? ""}`.toUpperCase();
});

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

async function logout() {
  auth.logout();
  await router.replace("/login");
}
</script>

<style scoped>
.user-summary {
  line-height: 1.15;
}

.user-summary__email {
  color: rgb(255 255 255 / 70%);
}
</style>
