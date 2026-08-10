import { defineRouter } from "#q-app";
import { useAuth } from "@/composables/useAuth";
import { createRouter, createWebHistory } from "vue-router";

import routes from "./routes";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store }) => {
  const createHistory = createWebHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  });

  Router.beforeEach(async to => {
    const auth = useAuth(store);
    const user = await auth.ensureSession();

    if (to.meta.requiresAuth && !user) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresManager && !user?.isAdmin && !user?.isOwner) {
      return "/dashboard";
    }

    if (to.meta.guestOnly && user) {
      return "/dashboard";
    }

    return true;
  });

  return Router;
});
