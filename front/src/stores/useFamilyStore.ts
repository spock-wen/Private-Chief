import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../api/request';

export interface Family {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  address?: string;
  addressDetail?: string;
  latitude?: number;
  longitude?: number;
  ownerId: string;
  owner?: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  role?: 'OWNER' | 'ADMIN';
  _count?: {
    members: number;
    dishes: number;
    tables: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN';
  user: {
    id: string;
    nickname: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  inviteCode: string;
  createdBy: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
}

export const useFamilyStore = defineStore('family', () => {
  const families = ref<Family[]>([]);
  const currentFamily = ref<Family | null>(null);
  const loading = ref(false);

  // 从 localStorage 恢复当前家庭
  const initFromStorage = () => {
    const storedFamilyId = localStorage.getItem('currentFamilyId');
    if (storedFamilyId && families.value.length > 0) {
      const family = families.value.find((f) => f.id === storedFamilyId);
      if (family) {
        currentFamily.value = family;
      }
    }
  };

  // 计算属性
  const hasFamily = computed(() => families.value.length > 0);
  const isOwner = computed(() => currentFamily.value?.role === 'OWNER');
  const isAdmin = computed(() => 
    currentFamily.value?.role === 'OWNER' || currentFamily.value?.role === 'ADMIN'
  );

  // 获取用户的所有家庭
  const fetchFamilies = async () => {
    loading.value = true;
    try {
      const data: Family[] = await request.get('/families');
      families.value = data;

      // 如果有家庭但没有选中当前家庭，自动选中第一个
      if (data.length > 0 && !currentFamily.value) {
        setCurrentFamily(data[0]);
      }

      initFromStorage();
      return data;
    } finally {
      loading.value = false;
    }
  };

  // 获取家庭详情
  const fetchFamily = async (id: string) => {
    loading.value = true;
    try {
      const data: Family = await request.get(`/families/${id}`);
      
      // 更新列表中的家庭信息
      const index = families.value.findIndex((f) => f.id === id);
      if (index !== -1) {
        families.value[index] = data;
      }

      // 如果是当前家庭，更新当前家庭信息
      if (currentFamily.value?.id === id) {
        currentFamily.value = data;
      }

      return data;
    } finally {
      loading.value = false;
    }
  };

  // 创建家庭
  const createFamily = async (data: {
    name: string;
    description?: string;
    avatar?: string;
    address?: string;
    addressDetail?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    loading.value = true;
    try {
      const family: Family = await request.post('/families', data);
      families.value.push(family);
      setCurrentFamily(family);
      return family;
    } finally {
      loading.value = false;
    }
  };

  // 更新家庭信息
  const updateFamily = async (id: string, data: Partial<Family>) => {
    loading.value = true;
    try {
      const family: Family = await request.patch(`/families/${id}`, data);
      
      // 更新列表
      const index = families.value.findIndex((f) => f.id === id);
      if (index !== -1) {
        families.value[index] = family;
      }

      // 更新当前家庭
      if (currentFamily.value?.id === id) {
        currentFamily.value = family;
      }

      return family;
    } finally {
      loading.value = false;
    }
  };

  // 删除家庭
  const deleteFamily = async (id: string) => {
    loading.value = true;
    try {
      await request.delete(`/families/${id}`);
      
      // 从列表中移除
      families.value = families.value.filter((f) => f.id !== id);

      // 如果删除的是当前家庭，切换到第一个家庭
      if (currentFamily.value?.id === id) {
        if (families.value.length > 0) {
          setCurrentFamily(families.value[0]);
        } else {
          currentFamily.value = null;
          localStorage.removeItem('currentFamilyId');
        }
      }
    } finally {
      loading.value = false;
    }
  };

  // 生成邀请码
  const createInvitation = async (familyId: string, maxUses = 1, expiresInDays = 7) => {
    loading.value = true;
    try {
      const invitation: FamilyInvitation = await request.post('/families/invitations', {
        familyId,
        maxUses,
        expiresInDays,
      });
      return invitation;
    } finally {
      loading.value = false;
    }
  };

  // 获取邀请码列表
  const fetchInvitations = async (familyId: string) => {
    loading.value = true;
    try {
      const invitations: FamilyInvitation[] = await request.get(
        `/families/${familyId}/invitations`
      );
      return invitations;
    } finally {
      loading.value = false;
    }
  };

  // 使用邀请码加入家庭
  const joinFamily = async (inviteCode: string) => {
    loading.value = true;
    try {
      const result: { family: Family; role: string } = await request.post('/families/join', {
        inviteCode,
      });
      
      // 添加到家庭列表
      const family = { ...result.family, role: result.role as 'OWNER' | 'ADMIN' };
      families.value.push(family);
      setCurrentFamily(family);
      
      return family;
    } finally {
      loading.value = false;
    }
  };

  // 移除家庭成员
  const removeMember = async (familyId: string, memberId: string) => {
    loading.value = true;
    try {
      await request.delete(`/families/${familyId}/members/${memberId}`);
    } finally {
      loading.value = false;
    }
  };

  // 设置当前家庭
  const setCurrentFamily = (family: Family) => {
    currentFamily.value = family;
    localStorage.setItem('currentFamilyId', family.id);
  };

  // 清除所有数据
  const clear = () => {
    families.value = [];
    currentFamily.value = null;
    localStorage.removeItem('currentFamilyId');
  };

  return {
    families,
    currentFamily,
    loading,
    hasFamily,
    isOwner,
    isAdmin,
    fetchFamilies,
    fetchFamily,
    createFamily,
    updateFamily,
    deleteFamily,
    createInvitation,
    fetchInvitations,
    joinFamily,
    removeMember,
    setCurrentFamily,
    clear,
  };
});

