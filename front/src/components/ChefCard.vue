<template>
  <div class="glass-card p-6 rounded-custom shadow-warm">
    <slot></slot>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(217, 119, 6, 0.1);
}
</style>
