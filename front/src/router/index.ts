import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/admin/menu',
      name: 'MenuLibrary',
      component: () => import('../views/admin/MenuLibrary.vue'),
    },
    {
      path: '/host/tables',
      name: 'TableList',
      component: () => import('../views/host/TableList.vue'),
    },
    {
      path: '/table/:id',
      name: 'TableDetail',
      component: () => import('../views/table/TableDetail.vue'),
    },
  ],
});

export default router;
