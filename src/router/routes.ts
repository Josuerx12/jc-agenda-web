import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    meta: { guestOnly: true },
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("@/pages/IndexPage.vue") },
      {
        path: "cadastro",
        component: () => import("@/pages/auth/Registration.vue")
      },
      { path: "login", component: () => import("@/pages/auth/Login.vue") },
      { path: "second", component: () => import("@/pages/SecondPage.vue") }
    ]
  },

  {
    path: "/dashboard",
    meta: { requiresAuth: true },
    component: () => import("@/layouts/DashboardLayout.vue"),
    children: [
      { path: "", component: () => import("@/pages/IndexPage.vue") },
      {
        path: "servicos",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/ServicesPage.vue")
      },
      {
        path: "servicos/novo",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/ServiceFormPage.vue")
      },
      {
        path: "servicos/:id",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/ServiceFormPage.vue")
      },
      {
        path: "usuarios",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/CompanyUsersPage.vue")
      },
      {
        path: "usuarios/novo",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/CompanyUserFormPage.vue")
      },
      {
        path: "usuarios/:id",
        meta: { requiresManager: true },
        component: () => import("@/pages/authenticated/CompanyUserFormPage.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("@/pages/ErrorNotFound.vue")
  }
];

export default routes;
