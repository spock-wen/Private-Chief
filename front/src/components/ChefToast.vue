<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto px-5 py-3 rounded-2xl shadow-lg backdrop-blur-md border text-sm font-bold flex items-center gap-3 min-w-[280px] max-w-[420px]',
            typeStyles[toast.type]
          ]"
        >
          <component :is="typeIcons[toast.type]" :size="18" />
          <span class="flex-1">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon } from 'lucide-vue-next';
import { useToast } from '../composables/useToast';

const { toasts } = useToast();

const typeStyles: Record<string, string> = {
  success: 'bg-green-50/90 text-green-700 border-green-200',
  error: 'bg-red-50/90 text-red-700 border-red-200',
  warning: 'bg-amber-50/90 text-amber-700 border-amber-200',
  info: 'bg-primary/5 text-primary border-primary/20',
};

const typeIcons: Record<string, any> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(80px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(80px) scale(0.95);
}
</style>
