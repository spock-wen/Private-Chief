<template>
  <div class="min-h-screen py-12 px-4 max-w-7xl mx-auto space-y-12 animate-fade-in-up">
    <!-- Hero Section -->
    <header class="text-center space-y-4">
      <h1 class="serif-title text-6xl font-bold text-text-dark tracking-tight">
        SpockChef <span class="text-primary">私厨</span>
      </h1>
      <p class="text-text-muted text-lg max-w-2xl mx-auto">
        为您的家宴营造温暖、私密且专业的数字化助手。从灵感筹备到轻松结算，让每一次聚餐都成为珍贵回忆。
      </p>
    </header>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
      <!-- Main Entry: My Tables -->
      <router-link 
        to="/host/tables" 
        class="md:col-span-2 md:row-span-2 chef-card chef-card-hover p-8 flex flex-col justify-between group overflow-hidden relative"
      >
        <div class="relative z-10">
          <div class="bg-accent/30 w-16 h-16 rounded-custom flex items-center justify-center mb-6 text-primary group-hover:rotate-12 transition-transform">
            <UtensilsIcon :size="32" />
          </div>
          <h2 class="serif-title text-4xl font-bold mb-4">开启一场聚餐</h2>
          <p class="text-text-muted leading-relaxed max-w-xs">
            拟定饭桌、挑选菜单、邀请好友投票。让众口不再难调。
          </p>
        </div>
        <div class="relative z-10 mt-8 flex items-center gap-2 text-primary font-bold">
          立即发起 <ArrowRightIcon :size="20" />
        </div>
        <!-- Decorative Background Element -->
        <div class="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <UtensilsIcon :size="240" />
        </div>
      </router-link>

      <!-- Secondary Entry: Menu Library -->
      <router-link 
        to="/admin/menu" 
        class="md:col-span-2 md:row-span-1 chef-card chef-card-hover p-8 flex items-center justify-between group overflow-hidden relative"
      >
        <div class="relative z-10">
          <h3 class="serif-title text-2xl font-bold mb-2">全量菜单库</h3>
          <p class="text-text-muted text-sm">管理您的私房菜谱，打造专属厨师武装库。</p>
        </div>
        <div class="bg-primary/10 p-4 rounded-custom text-primary relative z-10">
          <BookOpenIcon :size="28" />
        </div>
      </router-link>

      <!-- Stats or Decorative Card -->
      <div class="md:col-span-1 md:row-span-1 chef-card p-6 flex flex-col justify-center items-center text-center space-y-2 bg-gradient-to-br from-white/80 to-accent/20">
        <span class="text-3xl font-bold text-primary">24+</span>
        <span class="text-xs text-text-muted uppercase tracking-widest font-bold">私藏菜谱</span>
      </div>

      <!-- Quick Action/Tip Card -->
      <div class="md:col-span-1 md:row-span-1 chef-card p-6 flex flex-col justify-center space-y-3 border-dashed border-primary/20 bg-transparent">
        <div class="flex items-center gap-2 text-primary">
          <SparklesIcon :size="18" />
          <span class="text-xs font-bold uppercase tracking-wider">今日灵感</span>
        </div>
        <p class="text-sm italic text-text-muted">“家宴的温度，藏在每一次共同挑选的期待里。”</p>
      </div>
    </div>

    <!-- Footer Quote -->
    <footer class="text-center pt-8 border-t border-primary/5">
      <p class="text-text-muted/40 text-xs font-medium uppercase tracking-[0.2em]">Crafted for private dining excellence</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { UtensilsIcon, BookOpenIcon, ArrowRightIcon, SparklesIcon } from 'lucide-vue-next';
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
