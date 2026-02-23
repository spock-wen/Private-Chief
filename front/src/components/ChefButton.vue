<template>
  <button
    :type="type || 'button'"
    :class="[
      'rounded-custom font-bold transition-all animate-pop flex items-center justify-center gap-2',
      size === 'sm' ? 'px-4 py-2 text-sm' :
      size === 'lg' ? 'px-8 py-3 text-lg' :
      'px-6 py-2.5',
      variant === 'primary' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 
      variant === 'outline' ? 'bg-transparent text-primary border-2 border-primary hover:bg-primary/10' :
      'bg-white text-text-dark/60 border border-primary/10 hover:border-primary/30',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>();
</script>
