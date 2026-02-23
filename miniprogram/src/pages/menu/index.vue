<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { getDishes, createDish, updateDish, deleteDish } from '@/api/dishes';
import type { Dish, Category } from '@/types';
import Icons from '@/components/Icons.vue';

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
  { key: 'SOUP', label: '汤品' },
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

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      uni.uploadFile({
        url: 'https://your-upload-api.com/upload',
        filePath: tempFilePath,
        name: 'file',
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data);
          dishForm.image = data.url;
        },
        fail: () => {
          uni.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      });
    }
  });
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

  const headers = ['name', 'category', 'description', 'tags', 'image'];
  const csvContent = [
    headers.join(','),
    ...dishes.value.map(dish => {
      const name = escapeCsvField(dish.name || '');
      const category = escapeCsvField(dish.category || '');
      const description = escapeCsvField(dish.description || '');
      const tags = escapeCsvField(Array.isArray(dish.tags) ? dish.tags.join('|') : '');
      const image = escapeCsvField(dish.image || '');
      return `${name},${category},${description},${tags},${image}`;
    })
  ].join('\n');

  uni.setClipboardData({
    data: csvContent,
    success: () => {
      uni.showToast({
        title: `已复制 ${dishes.value.length} 条菜单数据`,
        icon: 'success'
      });
    }
  });
}

function escapeCsvField(field: string): string {
  if (!field) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCsvLine(lines[0]);
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
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
    importError.value = '请粘贴菜单 CSV 数据';
    return;
  }

  importing.value = true;
  importError.value = '';
  try {
    const rawData = parseCsv(importText.value);
    if (!rawData.length) {
      throw new Error('数据格式错误，请传入有效的CSV数据');
    }

    const payloads = rawData.map((item: any) => ({
      name: String(item.name || '').trim(),
      category: item.category || 'HOT_DISH',
      description: item.description || '',
      tags: item.tags ? item.tags.split('|').map((t: string) => t.trim()).filter(Boolean) : [],
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
  <view class="page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-status-bar"></view>
      <view class="nav-content">
        <view class="nav-back" @tap="uni.navigateBack({ delta: 1 })">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">菜单</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="page-content">
      <view class="toolbar">
        <button class="btn-primary" @click="openCreateDish">
          <Icons name="plus" class="btn-icon" />
          <text class="btn-text">添加菜品</text>
        </button>
        <view class="toolbar-actions">
          <button class="btn-secondary" @click="handleExportDishes">
            <Icons name="edit" class="btn-icon-small" />
            <text>导出</text>
          </button>
          <button class="btn-secondary" @click="openImportModal">
            <Icons name="edit" class="btn-icon-small" />
            <text>导入</text>
          </button>
          <button v-if="selectedDishIds.length" class="btn-text" @click="clearSelection">
            <text>取消选择</text>
          </button>
          <button v-if="selectedDishIds.length" class="btn-danger" @click="handleBatchDelete">
            <Icons name="trash" class="btn-icon-small" />
            <text>删除 {{ selectedDishIds.length }}</text>
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

      <view v-if="loading" class="empty-state">
        <view class="empty-illustration">
          <Icons name="loading" class="empty-icon-svg" />
        </view>
        <text class="empty-title">正在同步菜单数据...</text>
      </view>

      <view v-else-if="loadError" class="empty-state">
        <view class="empty-illustration">
          <Icons name="close" class="empty-icon-svg error" />
        </view>
        <text class="empty-title">{{ loadError }}</text>
        <button class="btn-primary" @click="loadDishes">重新加载</button>
      </view>

      <view v-else-if="filteredDishes.length === 0" class="empty-state">
        <view class="empty-illustration">
          <Icons name="dish" class="empty-icon-svg" />
        </view>
        <text class="empty-title">暂无菜品</text>
        <text class="empty-desc">点击上方"添加菜品"开始创建菜单</text>
      </view>

      <view v-else class="dish-grid">
        <view
          v-for="dish in filteredDishes"
          :key="dish.id"
          class="dish-card"
          :class="{ selected: isSelected(dish.id) }"
          @click="toggleSelectDish(dish.id)"
        >
          <view class="dish-checkbox" :class="{ checked: isSelected(dish.id) }">
            <text v-if="isSelected(dish.id)" class="check-icon">✓</text>
          </view>
          
          <image
            v-if="dish.image"
            :src="dish.image"
            class="dish-image"
            mode="aspectFill"
          />
          <view v-else class="dish-image placeholder">
            <text class="placeholder-icon">菜品</text>
          </view>
          
          <view class="dish-content">
            <text class="dish-name">{{ dish.name }}</text>
            <view class="dish-meta">
              <text class="dish-category">{{ getCategoryLabel(dish.category) }}</text>
              <view v-if="dish.tags?.length" class="dish-tags">
                <text v-for="tag in dish.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
                <text v-if="dish.tags.length > 2" class="tag-more">+{{ dish.tags.length - 2 }}</text>
              </view>
            </view>
            <view class="dish-actions">
              <button class="btn-small" @click.stop="openEditDish(dish)">
                <text>编辑</text>
              </button>
              <button class="btn-small btn-danger-small" @click.stop="handleDeleteDish(dish.id)">
                <text>删除</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="isEditorOpen" class="modal-overlay" @click="closeEditor">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ editingDishId ? '编辑菜品' : '新增菜品' }}</text>

        <view class="form-field">
          <text class="form-label">菜品名称</text>
          <input
            v-model="dishForm.name"
            class="form-input"
            placeholder="例如：秘制红烧肉"
            maxlength="50"
          />
        </view>

        <view class="form-field">
          <text class="form-label">分类</text>
          <picker
            mode="selector"
            :range="categories.slice(1).map(c => c.label)"
            @change="dishForm.category = categories.slice(1)[$event.detail.value].key as Category"
          >
            <view class="form-picker">
              <text class="picker-text">{{ getCategoryLabel(dishForm.category) }}</text>
              <text class="picker-icon">›</text>
            </view>
          </picker>
        </view>

        <view class="form-field">
          <text class="form-label">描述（可选）</text>
          <textarea
            v-model="dishForm.description"
            class="form-textarea"
            placeholder="可选，输入这道菜的描述"
            maxlength="200"
          />
        </view>

        <view class="form-field">
          <text class="form-label">菜品图片（可选）</text>
          <view class="image-upload">
            <image
              v-if="dishForm.image"
              :src="dishForm.image"
              class="preview-image"
              mode="aspectFill"
            />
            <view v-else class="upload-placeholder" @click="chooseImage">
              <Icons name="plus" class="upload-icon" />
              <text class="upload-text">点击上传图片</text>
            </view>
            <button v-if="dishForm.image" class="remove-image-btn" @click="dishForm.image = ''">
              <Icons name="close" class="btn-icon-small" />
              <text>移除</text>
            </button>
          </view>
        </view>

        <view class="form-field">
          <text class="form-label">标签（可选）</text>
          <input
            v-model="dishForm.tagsText"
            class="form-input"
            placeholder="如：招牌, 辣, 下饭（逗号分隔）"
            maxlength="100"
          />
        </view>

        <text v-if="formError" class="form-error">{{ formError }}</text>

        <view class="modal-actions">
          <button class="modal-btn secondary" @click="closeEditor">
            <text>取消</text>
          </button>
          <button class="modal-btn primary" :disabled="saving" @click="handleSaveDish">
            <text>{{ saving ? '保存中...' : '保存' }}</text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="isImportOpen" class="modal-overlay" @click="closeImportModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">批量导入菜单</text>
        <text class="modal-desc">请粘贴 CSV 数据（建议先用导出获取模板）</text>
        <textarea
          v-model="importText"
          class="form-textarea"
          placeholder="请粘贴CSV数据，格式：name,category,description,tags,image"
          maxlength="10000"
        />
        <text v-if="importError" class="form-error">{{ importError }}</text>
        <view class="modal-actions">
          <button class="modal-btn secondary" @click="closeImportModal">
            <text>取消</text>
          </button>
          <button class="modal-btn primary" :disabled="importing" @click="handleImportDishes">
            <text>{{ importing ? '导入中...' : '开始导入' }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 自定义导航栏 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #DC2626;
}

.nav-status-bar {
  height: var(--status-bar-height, 44rpx);
}

.nav-content {
  height: 100rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24rpx 16rpx;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 36rpx;
  color: white;
}

.nav-title {
  font-size: 30rpx;
  font-weight: 500;
  color: white;
  flex: 1;
  text-align: center;
  line-height: 1;
  padding-bottom: 4rpx;
}

.nav-right {
  width: 60rpx;
}

.page {
  min-height: 100vh;
  background: #FEF2F2;
  padding-top: 144rpx;
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.page-content {
  padding: 48rpx 32rpx 64rpx;
}

@media screen and (max-width: 375px) {
  .page-content {
    padding: 32rpx 24rpx 48rpx;
  }
  
  .header-title {
    font-size: 48rpx;
  }
  
  .header-subtitle {
    font-size: 24rpx;
  }
  
  .dish-grid {
    grid-template-columns: 1fr;
  }
  
  .dish-image {
    height: 180rpx;
  }
}

@media screen and (min-width: 414px) {
  .page-content {
    padding: 64rpx 48rpx 96rpx;
  }
  
  .header-title {
    font-size: 64rpx;
  }
  
  .header-subtitle {
    font-size: 32rpx;
  }
  
  .dish-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dish-image {
    height: 220rpx;
  }
}

@media screen and (min-width: 768px) {
  .dish-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.header {
  margin-bottom: 32rpx;
}

.header-title {
  display: block;
  font-size: 56rpx;
  color: #450A0A;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: #7F1D1D;
  line-height: 1.6;
}

.toolbar {
  margin-bottom: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #DC2626;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16rpx;
  transition: all 300ms ease;
}

.btn-primary::after {
  border: none;
}

.btn-primary:active {
  transform: scale(0.98);
  background: #B91C1C;
}

.btn-text {
  font-size: 28rpx;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.btn-secondary {
  height: 64rpx;
  padding: 0 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #450A0A;
  transition: all 300ms ease;
}

.btn-secondary::after {
  border: none;
}

.btn-secondary:active {
  transform: scale(0.98);
  background: #FEF2F2;
}

.btn-text {
  height: 64rpx;
  padding: 0 24rpx;
  background: transparent;
  border: none;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #991B1B;
}

.btn-text::after {
  border: none;
}

.btn-danger {
  height: 64rpx;
  padding: 0 24rpx;
  background: #FEF2F2;
  border: 2rpx solid #FECACA;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #DC2626;
  transition: all 300ms ease;
}

.btn-danger::after {
  border: none;
}

.btn-danger:active {
  transform: scale(0.98);
  background: #DC2626;
  color: #fff;
}

.category-scroll {
  margin-bottom: 24rpx;
}

.category-list {
  display: inline-flex;
  gap: 16rpx;
}

.category-item {
  padding: 8rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #450A0A;
  transition: all 300ms ease;
}

.category-item.active {
  background: #DC2626;
  border-color: #DC2626;
  color: #fff;
}

.category-item:active {
  transform: scale(0.98);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 96rpx 48rpx;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 20rpx;
}

.empty-illustration {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FEF2F2;
  border-radius: 50%;
  margin-bottom: 32rpx;
}

.empty-icon-svg {
  width: 64rpx;
  height: 64rpx;
  color: #DC2626;
}

.empty-icon-svg.error {
  color: #DC2626;
}

.empty-title {
  font-size: 32rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #7F1D1D;
  text-align: center;
  margin-bottom: 24rpx;
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
  color: #fff;
}

.btn-icon-small {
  width: 24rpx;
  height: 24rpx;
  color: #450A0A;
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.dish-card {
  position: relative;
  background: #FFFFFF;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  transition: all 300ms ease;
}

.dish-card.selected {
  border-color: #DC2626;
  box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.1);
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-checkbox {
  position: absolute;
  right: 16rpx;
  top: 16rpx;
  z-index: 2;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 2rpx solid #FECACA;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ease;
}

.dish-checkbox.checked {
  border-color: #DC2626;
  background: #DC2626;
}

.check-icon {
  font-size: 24rpx;
  color: #fff;
}

.dish-image {
  width: 100%;
  height: 200rpx;
}

.dish-image.placeholder {
  background: #FEF2F2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
  color: #991B1B;
}

.dish-content {
  padding: 24rpx;
}

.dish-name {
  display: block;
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.dish-category {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: #FEF2F2;
  color: #DC2626;
  font-size: 20rpx;
  border-radius: 999rpx;
  align-self: flex-start;
}

.dish-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 8rpx 16rpx;
  background: #FEF2F2;
  color: #450A0A;
  font-size: 20rpx;
  border-radius: 999rpx;
}

.tag-more {
  padding: 8rpx 16rpx;
  background: #FEF2F2;
  color: #991B1B;
  font-size: 20rpx;
  border-radius: 999rpx;
}

.dish-actions {
  display: flex;
  gap: 8rpx;
}

.btn-small {
  flex: 1;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FEF2F2;
  border: 2rpx solid #FECACA;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #450A0A;
  transition: all 300ms ease;
}

.btn-small::after {
  border: none;
}

.btn-small:active {
  transform: scale(0.98);
  background: #FEF2F2;
}

.btn-danger-small {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #DC2626;
}

.btn-danger-small:active {
  background: #DC2626;
  color: #fff;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(69, 10, 10, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 32rpx;
  animation: fadeIn 0.3s ease;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
  -webkit-overflow-scrolling: touch;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-title {
  display: block;
  font-size: 40rpx;
  color: #450A0A;
  font-weight: 700;
  margin-bottom: 32rpx;
  text-align: center;
}

.modal-desc {
  display: block;
  font-size: 24rpx;
  color: #991B1B;
  margin-bottom: 32rpx;
  text-align: center;
}

.form-field {
  margin-bottom: 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #450A0A;
  font-weight: 600;
  margin-bottom: 16rpx;
  word-wrap: break-word;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #450A0A;
  transition: all 300ms ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #DC2626;
  box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.1);
}

.form-input::placeholder {
  color: #991B1B;
  opacity: 0.6;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  transition: all 300ms ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.form-picker:active {
  border-color: #DC2626;
}

.picker-text {
  font-size: 28rpx;
  color: #450A0A;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-icon {
  font-size: 32rpx;
  color: #991B1B;
  flex-shrink: 0;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 24rpx 24rpx;
  background: #fff;
  border: 2rpx solid #FECACA;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #450A0A;
  transition: all 300ms ease;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
}

.form-textarea:focus {
  outline: none;
  border-color: #DC2626;
  box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.1);
}

.form-textarea::placeholder {
  color: #991B1B;
  opacity: 0.6;
}

.form-error {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #DC2626;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.modal-btn {
  flex: 1;
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 300ms ease;
  position: relative;
  overflow: hidden;
}

.modal-btn::after {
  border: none;
}

.modal-btn.primary {
  background: #DC2626;
  color: #fff;
  box-shadow: 0 4rpx 8rpx rgba(220, 38, 38, 0.3);
}

.modal-btn.primary:active {
  background: #B91C1C;
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 4rpx rgba(220, 38, 38, 0.3);
}

.modal-btn.secondary {
  background: #FEF2F2;
  color: #450A0A;
  border: 2rpx solid #FECACA;
}

.modal-btn.secondary:active {
  background: #FECACA;
  transform: translateY(2rpx);
}

.modal-btn:active {
  transform: translateY(2rpx);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-btn:disabled:active {
  transform: none;
}

/* 输入框聚焦效果 */
.form-input:focus,
.form-textarea:focus {
  animation: pulse 0.6s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4rpx rgba(220, 38, 38, 0.1);
  }
  50% {
    box-shadow: 0 0 0 8rpx rgba(220, 38, 38, 0.05);
  }
}

.image-upload {
  position: relative;
  width: 100%;
  height: 320rpx;
  border: 2rpx dashed #FECACA;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 300ms ease;
  box-sizing: border-box;
}

.image-upload:hover {
  border-color: #DC2626;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  object-fit: cover;
  display: block;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
  cursor: pointer;
  transition: all 300ms ease;
  border-radius: 16rpx;
  box-sizing: border-box;
  padding: 24rpx;
}

.upload-placeholder:active {
  background: linear-gradient(135deg, #FECACA 0%, #DC2626 100%);
  transform: scale(0.98);
}

.upload-icon {
  width: 80rpx;
  height: 80rpx;
  color: #DC2626;
  margin-bottom: 24rpx;
  transition: all 300ms ease;
  flex-shrink: 0;
}

.upload-placeholder:active .upload-icon {
  transform: scale(1.1) rotate(10deg);
}

.upload-text {
  font-size: 26rpx;
  color: #7F1D1D;
  font-weight: 500;
  text-align: center;
  word-wrap: break-word;
}

.remove-image-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  height: 56rpx;
  padding: 0 16rpx;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 300ms ease;
  backdrop-filter: blur(8rpx);
  z-index: 10;
}

.remove-image-btn::after {
  border: none;
}

.remove-image-btn:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 1);
}

.remove-image-btn text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  white-space: nowrap;
}
</style>
