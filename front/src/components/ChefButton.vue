<template>
  <button
    :type="type || 'button'"
    :class="[
      'px-6 py-2.5 rounded-custom font-bold transition-all animate-pop flex items-center justify-center gap-2',
      variant === 'primary' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-text-dark/60 border border-primary/10 hover:border-primary/30',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>();
</script>
