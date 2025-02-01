<template>
  <div class="auth-layout">
    <router-view v-slot="{ Component }">
      <transition 
        name="fade" 
        mode="out-in"
        enter-active-class="animate__animated animate__fadeIn"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, $background-color 0%, lighten($secondary-color, 10%) 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 