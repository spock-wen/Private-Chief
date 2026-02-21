<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getDishes, createDish, updateDish, deleteDish } from '@/api/dishes';
import type { Dish, Category } from '@/types';

const authStore = useAuthStore();
const familyStore = useFamilyStore();

const dishes = ref<Dish[]>([]);
const loading = ref(false);
const loadError = ref('');
const activeCategory = ref<Category | 'ALL'>('ALL');
const saving = ref(false);
const isEditorOpen = ref(false);
const editingDishId = ref<string | null>(null);
const formError = ref('');
const selectedDishIds = ref<string[]>([]);
const isImportOpen = ref(false);
const importText = ref('');
const importError = ref('');
const importing = ref(false);
const dishForm = reactive({
  name: '',
  category: 'HOT_DISH' as Category,
  description: '',
  tagsText: '',
  image: ''
});

const categories = [
  { key: 'ALL', label: '全部' },
  { key: 'HOT_DISH', label: '热菜' },
  { key: 'COLD_DISH', label: '凉菜' },
  { key: 'SOUP', label: '汤' },
  { key: 'STAPLE', label: '主食' },
  { key: 'DRINK', label: '饮料' }
];

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    uni.redirectTo({ url: '/pages/auth/login' });
    return;
  }

  if (!familyStore.hasFamily) {
    try {
      await familyStore.fetchFamilies();
    } catch (e) {
      console.error('获取家庭列表失败', e);
    }
    if (!familyStore.hasFamily) {
      uni.redirectTo({ url: '/pages/onboarding/welcome' });
      return;
    }
  }

  await loadDishes();
});

async function loadDishes() {
  if (!familyStore.currentFamilyId) return;
  
  loading.value = true;
  loadError.value = '';
  try {
    dishes.value = await getDishes(familyStore.currentFamilyId);
  } catch (error) {
    console.error('加载菜单失败', error);
    loadError.value = '加载失败，请检查网络后重试';
  } finally {
    loading.value = false;
  }
}

const filteredDishes = computed(() => {
  if (activeCategory.value === 'ALL') {
    return dishes.value;
  }
  return dishes.value.filter(d => d.category === activeCategory.value);
});

function getCategoryLabel(category: Category) {
  const cat = categories.find(c => c.key === category);
  return cat?.label || category;
}

function openCreateDish() {
  editingDishId.value = null;
  formError.value = '';
  dishForm.name = '';
  dishForm.category = 'HOT_DISH' as Category;
  dishForm.description = '';
  dishForm.tagsText = '';
  dishForm.image = '';
  isEditorOpen.value = true;
}

function openEditDish(dish: Dish) {
  editingDishId.value = dish.id;
  formError.value = '';
  dishForm.name = dish.name || '';
  dishForm.category = dish.category || ('HOT_DISH' as Category);
  dishForm.description = dish.description || '';
  dishForm.tagsText = Array.isArray(dish.tags) ? dish.tags.join(', ') : '';
  dishForm.image = dish.image || '';
  isEditorOpen.value = true;
}

function closeEditor() {
  isEditorOpen.value = false;
}

async function handleSaveDish() {
  if (!dishForm.name.trim()) {
    formError.value = '请输入菜品名称';
    return;
  }
  if (!familyStore.currentFamilyId) {
    uni.showToast({
      title: '请先选择家庭',
      icon: 'none'
    });
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    const payload = {
      name: dishForm.name.trim(),
      category: dishForm.category,
      description: dishForm.description.trim() || undefined,
      tags: dishForm.tagsText.split(',').map(t => t.trim()).filter(Boolean),
      image: dishForm.image || undefined,
      familyId: familyStore.currentFamilyId
    };

    if (editingDishId.value) {
      await updateDish(editingDishId.value, payload);
    } else {
      await createDish(payload);
    }

    uni.showToast({
      title: editingDishId.value ? '更新成功' : '创建成功',
      icon: 'success'
    });
    closeEditor();
    await loadDishes();
  } catch (error: any) {
    console.error('保存菜品失败', error);
    formError.value = error?.message || '保存失败，请检查网络后重试';
  } finally {
    saving.value = false;
  }
}

async function handleDeleteDish(id: string) {
  uni.showModal({
    title: '删除菜品',
    content: '确定要删除这道菜品吗？',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await deleteDish(id);
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        await loadDishes();
      } catch (error: any) {
        console.error('删除菜品失败', error);
        uni.showToast({
          title: error?.message || '删除失败，请检查网络后重试',
          icon: 'none'
        });
      }
    }
  });
}

function toggleSelectDish(id: string) {
  const idx = selectedDishIds.value.indexOf(id);
  if (idx >= 0) {
    selectedDishIds.value.splice(idx, 1);
  } else {
    selectedDishIds.value.push(id);
  }
}

function isSelected(id: string) {
  return selectedDishIds.value.includes(id);
}

function clearSelection() {
  selectedDishIds.value = [];
}

async function handleBatchDelete() {
  if (!selectedDishIds.value.length) return;
  uni.showModal({
    title: '批量删除',
    content: `确定删除已选的 ${selectedDishIds.value.length} 道菜品吗？`,
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await Promise.all(selectedDishIds.value.map(id => deleteDish(id)));
        uni.showToast({
          title: '批量删除成功',
          icon: 'success'
        });
        clearSelection();
        await loadDishes();
      } catch (error: any) {
        console.error('批量删除失败', error);
        uni.showToast({
          title: error?.message || '批量删除失败，请检查网络后重试',
          icon: 'none'
        });
      }
    }
  });
}

function handleExportDishes() {
  if (!dishes.value.length) {
    uni.showToast({
      title: '暂无菜品可导出',
      icon: 'none'
    });
    return;
  }

  const payload = dishes.value.map(d => ({
    name: d.name,
    category: d.category,
    description: d.description || '',
    tags: Array.isArray(d.tags) ? d.tags : [],
    image: d.image || ''
  }));

  uni.setClipboardData({
    data: JSON.stringify(payload, null, 2),
    success: () => {
      uni.showToast({
        title: `已复制 ${payload.length} 条菜单数据`,
        icon: 'success'
      });
    }
  });
}

function openImportModal() {
  importText.value = '';
  importError.value = '';
  isImportOpen.value = true;
}

function closeImportModal() {
  isImportOpen.value = false;
}

async function handleImportDishes() {
  if (!familyStore.currentFamilyId) {
    importError.value = '请先选择家庭';
    return;
  }
  if (!importText.value.trim()) {
    importError.value = '请粘贴菜单 JSON 数据';
    return;
  }

  importing.value = true;
  importError.value = '';
  try {
    const raw = JSON.parse(importText.value);
    if (!Array.isArray(raw) || !raw.length) {
      throw new Error('数据格式错误，请传入数组');
    }

    const payloads = raw.map((item: any) => ({
      name: String(item.name || '').trim(),
      category: item.category || 'HOT_DISH',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      image: item.image || '',
      familyId: familyStore.currentFamilyId
    })).filter((item: any) => item.name);

    if (!payloads.length) {
      throw new Error('未发现可导入的有效菜品');
    }

    let success = 0;
    for (const p of payloads) {
      try {
        await createDish(p);
        success += 1;
      } catch (e) {
        console.error('导入单条失败', e);
      }
    }

    uni.showToast({
      title: `导入完成 ${success}/${payloads.length}`,
      icon: success > 0 ? 'success' : 'none'
    });
    if (success > 0) {
      closeImportModal();
      await loadDishes();
    }
  } catch (error: any) {
    console.error('导入失败', error);
    importError.value = error?.message || '导入失败，请检查数据格式';
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <view class="mp-page">
    <view class="mp-shell">
      <view class="mp-header">
        <text class="mp-title">菜单库</text>
        <text class="mp-subtitle">按分类整理家庭菜谱，支持批量导入和批量清理。</text>
      </view>

      <view class="toolbar mp-card">
        <button class="mp-primary-btn toolbar-primary" @click="openCreateDish">添加菜品</button>
        <view class="toolbar-row">
          <button class="mini-btn" @click="handleExportDishes">导出</button>
          <button class="mini-btn" @click="openImportModal">导入</button>
          <button v-if="selectedDishIds.length" class="mini-btn danger" @click="clearSelection">取消选择</button>
          <button v-if="selectedDishIds.length" class="mini-btn danger-solid" @click="handleBatchDelete">
            删除 {{ selectedDishIds.length }}
          </button>
        </view>
      </view>

      <scroll-view class="category-scroll" scroll-x="true">
        <view class="category-list">
          <view
            v-for="cat in categories"
            :key="cat.key"
            class="category-item"
            :class="{ active: activeCategory === cat.key }"
            @click="activeCategory = cat.key as any"
          >
            {{ cat.label }}
          </view>
        </view>
      </scroll-view>

      <view v-if="loading" class="mp-card mp-empty">
        <text class="mp-empty-title">加载中</text>
        <text class="mp-empty-desc">正在同步菜单数据...</text>
      </view>

      <view v-else-if="loadError" class="mp-card mp-empty">
        <text class="mp-empty-title">数据加载失败</text>
        <text class="mp-empty-desc">{{ loadError }}</text>
        <button class="mp-secondary-btn retry-btn" @click="loadDishes">重新加载</button>
      </view>

      <view v-else-if="filteredDishes.length === 0" class="mp-card mp-empty">
        <text class="mp-empty-title">暂无菜品</text>
        <text class="mp-empty-desc">先添加第一道菜，后续可用导入快速补齐。</text>
      </view>

      <view v-else class="dish-grid">
        <view
          v-for="dish in filteredDishes"
          :key="dish.id"
          class="dish-card mp-card"
          :class="{ selected: isSelected(dish.id) }"
        >
          <view class="select-dot" :class="{ checked: isSelected(dish.id) }" @click="toggleSelectDish(dish.id)">
            <text v-if="isSelected(dish.id)">✓</text>
          </view>
          <image
            v-if="dish.image"
            :src="dish.image"
            class="dish-image"
            mode="aspectFill"
          />
          <view v-else class="dish-image placeholder">
            <text>🍽️</text>
          </view>
          <view class="dish-info">
            <text class="dish-name">{{ dish.name }}</text>
            <text class="dish-category">{{ getCategoryLabel(dish.category) }}</text>
            <view v-if="dish.tags?.length" class="dish-tags">
              <text v-for="tag in dish.tags" :key="tag" class="tag">{{ tag }}</text>
            </view>
            <view class="dish-actions">
              <button class="mini-btn" @click="openEditDish(dish)">编辑</button>
              <button class="mini-btn danger-solid" @click="handleDeleteDish(dish.id)">删除</button>
            </view>
          </view>
        </view>
      </view>

      <view v-if="isEditorOpen" class="modal-overlay" @click="closeEditor">
        <view class="modal-content" @click.stop>
          <text class="modal-title">{{ editingDishId ? '编辑菜品' : '新增菜品' }}</text>

          <view class="mp-field">
            <text class="mp-label">菜品名称</text>
            <input
              v-model="dishForm.name"
              class="mp-input"
              placeholder="例如：秘制红烧肉"
            />
          </view>

          <view class="mp-field">
            <text class="mp-label">分类</text>
            <picker
              mode="selector"
              :range="categories.slice(1).map(c => c.label)"
              @change="dishForm.category = categories.slice(1)[$event.detail.value].key as Category"
            >
              <view class="mp-input picker-input">{{ getCategoryLabel(dishForm.category) }}</view>
            </picker>
          </view>

          <view class="mp-field">
            <text class="mp-label">描述</text>
            <textarea
              v-model="dishForm.description"
              class="form-textarea"
              placeholder="可选，输入这道菜的描述"
            />
          </view>

          <view class="mp-field">
            <text class="mp-label">标签</text>
            <input
              v-model="dishForm.tagsText"
              class="mp-input"
              placeholder="如：招牌, 辣, 下饭（逗号分隔）"
            />
          </view>

          <text v-if="formError" class="mp-helper-text">{{ formError }}</text>

          <view class="modal-actions">
            <button class="mp-secondary-btn half-btn" @click="closeEditor">取消</button>
            <button class="mp-primary-btn half-btn" :loading="saving" :disabled="saving" @click="handleSaveDish">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </view>
        </view>
      </view>

      <view v-if="isImportOpen" class="modal-overlay" @click="closeImportModal">
        <view class="modal-content" @click.stop>
          <text class="modal-title">批量导入菜单</text>
          <text class="import-tip">请粘贴 JSON 数组（建议先用导出获取模板）。</text>
          <textarea
            v-model="importText"
            class="form-textarea"
            placeholder="例如：[{name: 红烧肉, category: HOT_DISH, tags: [招牌]}]"
          />
          <text v-if="importError" class="mp-helper-text">{{ importError }}</text>
          <view class="modal-actions">
            <button class="mp-secondary-btn half-btn" @click="closeImportModal">取消</button>
            <button class="mp-primary-btn half-btn" :loading="importing" :disabled="importing" @click="handleImportDishes">
              {{ importing ? '导入中...' : '开始导入' }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.toolbar {
  padding: 18rpx;
  margin-bottom: 16rpx;
}

.toolbar-primary {
  margin-bottom: 14rpx;
}

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.mini-btn {
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 18rpx;
  border: 2rpx solid var(--border-200);
  border-radius: 999rpx;
  background: #fff;
  color: var(--text-700);
  font-size: 24rpx;
}

.mini-btn::after {
  border: none;
}

.mini-btn.danger {
  color: var(--danger-500);
}

.mini-btn.danger-solid {
  background: rgba(191, 75, 62, 0.14);
  color: var(--danger-500);
  border-color: rgba(191, 75, 62, 0.25);
}

.retry-btn {
  width: 260rpx;
  margin: 20rpx auto 0;
}

.category-scroll {
  margin-bottom: 16rpx;
}

.category-list {
  display: inline-flex;
  gap: 12rpx;
}

.category-item {
  padding: 12rpx 24rpx;
  background: var(--bg-soft);
  border-radius: 999rpx;
  font-size: 24rpx;
  color: var(--text-700);
}

.category-item.active {
  background: rgba(154, 91, 51, 0.14);
  color: var(--brand-600);
  font-weight: 600;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.dish-card {
  overflow: hidden;
  position: relative;
}

.dish-card.selected {
  border-color: rgba(154, 91, 51, 0.55);
}

.select-dot {
  position: absolute;
  right: 14rpx;
  top: 14rpx;
  z-index: 2;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2rpx solid var(--border-200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-600);
  font-size: 22rpx;
}

.select-dot.checked {
  border-color: var(--brand-500);
  background: rgba(154, 91, 51, 0.12);
}

.dish-image {
  width: 100%;
  height: 240rpx;
}

.dish-image.placeholder {
  background: var(--bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
}

.dish-info {
  padding: 18rpx;
}

.dish-name {
  font-size: 28rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
  color: var(--text-900);
}

.dish-category {
  font-size: 24rpx;
  color: var(--brand-500);
  display: block;
  margin-bottom: 12rpx;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: var(--bg-soft);
  border-radius: 999rpx;
  color: var(--text-700);
}

.dish-actions {
  margin-top: 16rpx;
  display: flex;
  gap: 8rpx;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(47, 36, 28, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 88%;
  max-height: 84vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  border: 2rpx solid var(--border-200);
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
  display: block;
  color: var(--text-900);
}

.picker-input {
  line-height: 88rpx;
}

.form-textarea {
  width: 100%;
  min-height: 140rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid var(--border-200);
  border-radius: 16rpx;
  background: #fff;
  font-size: 26rpx;
  color: var(--text-900);
}

.modal-actions {
  margin-top: 12rpx;
  display: flex;
  gap: 14rpx;
}

.half-btn {
  flex: 1;
}

.import-tip {
  font-size: 22rpx;
  color: var(--text-500);
  margin-bottom: 14rpx;
  display: block;
}
</style>
