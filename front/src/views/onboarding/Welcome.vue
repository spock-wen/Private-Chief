<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 to-white px-4 relative">
    <!-- 顶部操作栏 -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between">
      <button
        @click="handleLogout"
        class="px-4 py-2 text-sm text-text-muted hover:text-red-600 transition-colors flex items-center gap-2"
      >
        <LogOutIcon :size="16" />
        注销登录
      </button>
      <button
        @click="skipOnboarding"
        class="px-4 py-2 text-sm text-text-muted hover:text-primary transition-colors"
      >
        稍后设置 →
      </button>
    </div>

    <div class="max-w-4xl w-full space-y-12 animate-fade-in-up">
      <!-- 欢迎标题 -->
      <div class="text-center space-y-4">
        <h1 class="serif-title text-5xl font-bold text-text-dark">
          欢迎来到 <span class="text-primary">SpockChef</span>
        </h1>
        <p class="text-text-muted text-lg">
          开始前，请先创建或加入一个家庭
        </p>
      </div>

      <!-- 选项卡 -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 创建家庭 -->
        <div 
          class="chef-card p-8 cursor-pointer hover:border-primary transition-all group"
          @click="showCreateModal = true"
        >
          <div class="text-center space-y-4">
            <div class="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <HomeIcon :size="40" class="text-primary" />
            </div>
            <h2 class="text-2xl font-bold">创建家庭</h2>
            <p class="text-text-muted text-sm">
              成为家庭主人，管理专属菜谱库和饭桌
            </p>
            <div class="pt-2">
              <span class="inline-flex items-center gap-2 text-primary font-bold">
                立即创建 <ArrowRightIcon :size="18" />
              </span>
            </div>
          </div>
        </div>

        <!-- 加入家庭 -->
        <div 
          class="chef-card p-8 cursor-pointer hover:border-primary transition-all group"
          @click="showJoinModal = true"
        >
          <div class="text-center space-y-4">
            <div class="w-20 h-20 mx-auto bg-accent/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UsersIcon :size="40" class="text-primary" />
            </div>
            <h2 class="text-2xl font-bold">加入家庭</h2>
            <p class="text-text-muted text-sm">
              使用邀请码加入现有家庭，成为管理员
            </p>
            <div class="pt-2">
              <span class="inline-flex items-center gap-2 text-primary font-bold">
                输入邀请码 <ArrowRightIcon :size="18" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建家庭弹窗 -->
    <CreateFamilyModal v-model="showCreateModal" @success="onFamilyCreated" />
    
    <!-- 加入家庭弹窗 -->
    <JoinFamilyModal v-model="showJoinModal" @success="onFamilyJoined" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { HomeIcon, UsersIcon, ArrowRightIcon, LogOutIcon } from 'lucide-vue-next';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useAuthStore } from '@/stores/useAuthStore';
import CreateFamilyModal from '@/components/CreateFamilyModal.vue';
import JoinFamilyModal from '@/components/JoinFamilyModal.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();
const familyStore = useFamilyStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const showJoinModal = ref(false);

// 检查是否已有家庭
onMounted(async () => {
  try {
    await familyStore.fetchFamilies();
    
    // 如果已经有家庭，直接跳转到首页
    if (familyStore.hasFamily) {
      router.push('/');
    }
  } catch (error) {
    console.error('Failed to fetch families:', error);
  }
});

const onFamilyCreated = () => {
  // 创建成功后，跳转到首页
  router.push('/');
};

const onFamilyJoined = () => {
  router.push('/');
};

const skipOnboarding = () => {
  toast.warning('请先创建或加入家庭以继续使用');
};

const handleLogout = () => {
  authStore.logout();
  familyStore.clear();
  router.push('/login');
};
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
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

