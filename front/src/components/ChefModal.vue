<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 bg-text-dark/40 backdrop-blur-sm" @click.self="closeOnOutsideClick !== false && $emit('update:modelValue', false)">
        <Transition name="scale">
          <div v-if="modelValue" :class="['bg-white w-full rounded-3xl shadow-2xl overflow-hidden border border-primary/10 flex flex-col max-h-[85vh] sm:max-h-[80vh] m-auto', maxWidth || 'max-w-lg']">
            <!-- Header -->
            <div class="px-6 py-5 sm:px-8 sm:py-6 border-b border-primary/5 flex items-center justify-between bg-accent/5 flex-shrink-0">
              <h3 class="serif-title text-xl sm:text-2xl font-bold text-text-dark">{{ title }}</h3>
              <button v-if="showClose !== false" @click="$emit('update:modelValue', false)" class="p-2 hover:bg-primary/10 rounded-full transition-colors text-text-dark/40 cursor-pointer">
                <XIcon :size="20" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 sm:p-8 overflow-y-auto custom-scrollbar overscroll-contain">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-5 sm:px-8 sm:py-6 bg-gray-50/50 border-t border-primary/5 flex justify-end gap-3 flex-shrink-0">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next';

defineProps<{
  modelValue: boolean;
  title: string;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
  showClose?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 119, 6, 0.3);
}
</style>
