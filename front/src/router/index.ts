import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useFamilyStore } from '../stores/useFamilyStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, requiresFamily: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/Register.vue'),
      meta: { guest: true },
    },
    {
      path: '/onboarding',
      name: 'Onboarding',
      component: () => import('../views/onboarding/Welcome.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/menu',
      name: 'MenuLibrary',
      component: () => import('../views/admin/MenuLibrary.vue'),
      meta: { requiresAuth: true, requiresFamily: true },
    },
    {
      path: '/host/tables',
      name: 'TableList',
      component: () => import('../views/host/TableList.vue'),
      meta: { requiresAuth: true, requiresFamily: true },
    },
    {
      path: '/table/:id',
      name: 'TableDetail',
      component: () => import('../views/table/TableDetail.vue'),
      // 客人可访问，不需要登录
    },
  ],
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const familyStore = useFamilyStore();

  // 如果是访客页面（登录/注册），已登录用户直接跳转首页
  if (to.meta.guest && authStore.isLoggedIn) {
    return next('/');
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      return next('/login');
    }

    // 需要家庭的页面
    if (to.meta.requiresFamily) {
      // 如果还没有加载家庭列表，先加载
      if (familyStore.families.length === 0) {
        try {
          await familyStore.fetchFamilies();
        } catch (error) {
          console.error('Failed to fetch families:', error);
        }
      }

      // 如果没有家庭，跳转到引导页
      if (!familyStore.hasFamily && to.path !== '/onboarding') {
        return next('/onboarding');
      }
    }
  }

  next();
});

export default router;
