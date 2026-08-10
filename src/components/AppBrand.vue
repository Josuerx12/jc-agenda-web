<template>
  <router-link :to="brandDestination" class="app-brand" aria-label="JC Agenda">
    <span class="app-brand__mark" aria-hidden="true">
      <svg viewBox="0 0 44 44" role="img">
        <rect x="7" y="9" width="30" height="28" rx="8" />
        <path d="M7 18h30" />
        <path class="app-brand__ring" d="M15 6v7M29 6v7" />
        <path class="app-brand__check" d="m14.5 27 4.5 4 10-10" />
      </svg>
    </span>

    <span class="app-brand__wordmark">
      <span class="app-brand__jc">JC</span>
      <span class="app-brand__agenda">Agenda</span>
    </span>
  </router-link>
</template>

<script lang="ts" setup>
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const auth = useAuth();
const { isAuthenticated } = storeToRefs(auth);
const brandDestination = computed(() =>
  isAuthenticated.value ? "/dashboard" : "/"
);
</script>

<style scoped>
.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  width: fit-content;
  color: #fff;
  text-decoration: none;
}

.app-brand__mark {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 13px;
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 18%),
    rgb(255 255 255 / 7%)
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 14%),
    0 5px 14px rgb(34 24 39 / 18%);
}

.app-brand__mark::after {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgb(214 179 106 / 20%);
  content: "";
}

.app-brand__mark svg {
  width: 34px;
  height: 34px;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.app-brand__mark .app-brand__ring,
.app-brand__mark .app-brand__check {
  stroke: #f0ce88;
  stroke-width: 2.7;
}

.app-brand__wordmark {
  display: inline-flex;
  align-items: baseline;
  font-size: 1.22rem;
  letter-spacing: -0.035em;
  line-height: 1;
}

.app-brand__jc {
  font-weight: 800;
}

.app-brand__agenda {
  margin-left: 4px;
  color: rgb(255 255 255 / 82%);
  font-weight: 400;
}

.app-brand:hover .app-brand__agenda {
  color: #fff;
}

@media (max-width: 420px) {
  .app-brand {
    gap: 8px;
  }

  .app-brand__mark {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .app-brand__mark svg {
    width: 31px;
    height: 31px;
  }

  .app-brand__wordmark {
    font-size: 1.08rem;
  }
}
</style>
