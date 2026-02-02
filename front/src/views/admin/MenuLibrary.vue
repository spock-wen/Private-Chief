<template>
  <div class="max-w-7xl mx-auto py-12 px-4 space-y-8 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <nav class="text-xs font-bold text-primary/60 uppercase tracking-widest flex items-center gap-2">
          <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
          <span>/</span>
          <span class="text-primary">菜单库</span>
        </nav>
        <h1 class="serif-title text-4xl font-bold text-text-dark">全量菜单库</h1>
        <p class="text-text-muted text-sm">在这里管理您的私藏菜谱，作为每一次家宴的灵感源泉。</p>
      </div>
      <div class="flex gap-3">
        <ChefButton variant="secondary" @click="isImportModalOpen = true" class="shadow-sm hover:shadow-primary/10">
          <UploadCloudIcon :size="20" />
          批量导入
        </ChefButton>
        <ChefButton variant="primary" @click="isAddModalOpen = true" class="shadow-lg hover:shadow-primary/30">
          <PlusIcon :size="20" />
          新增私房菜
        </ChefButton>
      </div>
    </header>

    <!-- Control Bar -->
    <div class="chef-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <!-- Batch Action -->
        <div v-if="selectedIds.length > 0" class="flex items-center gap-3 animate-pop">
          <span class="text-xs font-bold text-primary">已选 {{ selectedIds.length }} 项</span>
          <button @click="batchDelete" class="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1">
            <Trash2Icon :size="14" />
            批量删除
          </button>
          <button @click="selectedIds = []" class="text-xs text-text-dark/40 hover:text-text-dark font-bold">取消</button>
        </div>

        <!-- Search -->
        <div class="relative w-full md:w-80 group">
          <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors" :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索菜名、食材或标签..."
            class="w-full pl-12 pr-4 py-3 bg-white/60 border border-primary/5 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      <!-- Categories -->
      <div class="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto custom-scrollbar">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="activeCategory = cat.value"
          :class="[
            'px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2',
            activeCategory === cat.value 
              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
              : 'bg-white/60 text-text-muted hover:bg-white hover:text-primary border border-primary/5'
          ]"
        >
          <component :is="cat.icon" :size="14" v-if="cat.icon" />
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Dish Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="dish in filteredDishes" 
        :key="dish.id" 
        class="chef-card chef-card-hover group overflow-hidden flex flex-col relative"
        @click="toggleSelection(dish.id)"
      >
        <!-- Selection Overlay -->
        <div 
          class="absolute top-3 right-3 z-20 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center"
          :class="selectedIds.includes(dish.id) ? 'bg-primary border-primary' : 'bg-white/40 border-white/60 group-hover:border-white'"
        >
          <CheckIcon v-if="selectedIds.includes(dish.id)" :size="14" class="text-white" />
        </div>
        <!-- Image Container -->
        <div class="h-48 overflow-hidden relative">
          <img 
            :src="dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-text-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div class="flex gap-2 w-full">
              <button @click.stop="editDish(dish)" class="flex-1 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold hover:bg-white/40 transition-colors">编辑</button>
              <button @click.stop="deleteDish(dish.id)" class="px-3 py-2 bg-red-500/20 backdrop-blur-md rounded-lg text-red-200 text-xs font-bold hover:bg-red-500/40 transition-colors">删除</button>
            </div>
          </div>
          <span class="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-primary shadow-sm">
            {{ categoryLabels[dish.category] }}
          </span>
        </div>

        <!-- Info -->
        <div class="p-5 space-y-3 flex-1 flex flex-col">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-text-dark group-hover:text-primary transition-colors line-clamp-1">{{ dish.name }}</h3>
          </div>
          <p class="text-text-muted/60 text-xs line-clamp-2 leading-relaxed italic">
            {{ dish.description || '暂无描述，这是一道充满神秘感的私房菜。' }}
          </p>
          <div class="flex flex-wrap gap-1.5 mt-auto pt-2">
            <span 
              v-for="tag in dish.tags" 
              :key="tag" 
              class="px-2 py-0.5 bg-accent/20 text-text-muted text-[10px] font-bold rounded-md border border-primary/5"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Dish Modal -->
    <ChefModal v-model="isAddModalOpen" :title="editingDishId ? '编辑私房菜' : '新增私房菜'" max-width="max-w-4xl">
      <form id="saveDishForm" @submit.prevent="saveDish" class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Left: Image Section -->
        <div class="md:col-span-5 space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">菜品封面</label>
            <div 
              class="relative w-full aspect-[4/3] bg-accent/5 rounded-2xl overflow-hidden border-2 border-dashed border-primary/10 flex flex-col items-center justify-center group hover:border-primary/30 transition-all cursor-pointer"
              @click="triggerFileInput"
            >
              <img v-if="dishForm.image" :src="dishForm.image" class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="text-primary/30 flex flex-col items-center gap-2 group-hover:text-primary/50 transition-colors">
                <ImageIcon :size="32" />
                <span class="text-xs font-bold">点击上传图片</span>
              </div>
              <div v-if="dishForm.image" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs">
                点击更换
              </div>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileChange"
            />
          </div>
          <div class="space-y-1.5">
            <input 
              v-model="dishForm.image" 
              type="text" 
              placeholder="输入图片 URL 或点击上方上传..." 
              class="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary/30 outline-none transition-all text-sm"
            />
            <p class="text-[10px] text-text-muted/60 pl-1">支持本地上传，或输入 JPG, PNG, WebP 等链接</p>
          </div>
        </div>

        <!-- Right: Form Fields -->
        <div class="md:col-span-7 space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">菜品名称</label>
            <input 
              v-model="dishForm.name" 
              type="text" 
              placeholder="例如：秘制红烧肉" 
              class="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary/30 outline-none transition-all text-sm"
              required
            />
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">分类</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                v-for="cat in categories.filter(c => c.value !== 'ALL')"
                :key="cat.value"
                @click="dishForm.category = cat.value as Category"
                :class="[
                  'py-2.5 rounded-xl text-xs font-bold transition-all border',
                  dishForm.category === cat.value 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                    : 'bg-white border-primary/5 text-text-muted hover:border-primary/30 hover:text-primary'
                ]"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">描述 (可选)</label>
            <textarea 
              v-model="dishForm.description" 
              rows="4"
              placeholder="讲述这道菜背后的故事，比如：这道菜是奶奶传下来的..." 
              class="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary/30 outline-none transition-all text-sm resize-none"
            ></textarea>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-text-dark/60 uppercase tracking-wider">标签 (以逗号分隔)</label>
            <input 
              v-model="tagsInput" 
              type="text" 
              placeholder="招牌, 辣, 需提前预定" 
              class="w-full px-4 py-3 rounded-xl border border-primary/10 focus:border-primary/30 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="closeModal" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">取消</button>
        <ChefButton variant="primary" type="submit" form="saveDishForm" :disabled="isLoading">
          {{ isLoading ? '保存中...' : (editingDishId ? '更新菜品' : '确认新增') }}
        </ChefButton>
      </template>
    </ChefModal>

    <!-- Import Modal -->
    <ImportDishesModal v-model="isImportModalOpen" @success="fetchDishes" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { 
  PlusIcon, SearchIcon, FlameIcon, SnowflakeIcon, CoffeeIcon, 
  SoupIcon, PizzaIcon, LayersIcon, Trash2Icon, CheckIcon, ImageIcon, UploadCloudIcon
} from 'lucide-vue-next';
import ChefButton from '../../components/ChefButton.vue';
import ChefModal from '../../components/ChefModal.vue';
import ImportDishesModal from './ImportDishesModal.vue';
import request from '../../api/request';
import type { Dish } from '../../types';
import { Category } from '../../types';

const dishes = ref<Dish[]>([]);
const searchQuery = ref('');
const activeCategory = ref<Category | 'ALL'>('ALL');
const isAddModalOpen = ref(false);
const isImportModalOpen = ref(false);
const isLoading = ref(false);
const editingDishId = ref<string | null>(null);
const selectedIds = ref<string[]>([]);
const tagsInput = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

interface DishForm {
  name: string;
  category: Category;
  description: string;
  image: string;
  tags: string[];
}

const dishForm = reactive<DishForm>({
  name: '',
  category: Category.HOT_DISH,
  description: '',
  image: '',
  tags: []
});

const categories: Array<{
  label: string;
  value: Category | 'ALL';
  icon: any;
}> = [
  { label: '全部', value: 'ALL', icon: LayersIcon },
  { label: '热菜', value: Category.HOT_DISH, icon: FlameIcon },
  { label: '凉菜', value: Category.COLD_DISH, icon: SnowflakeIcon },
  { label: '汤品', value: Category.SOUP, icon: SoupIcon },
  { label: '主食', value: Category.STAPLE, icon: PizzaIcon },
  { label: '饮料', value: Category.DRINK, icon: CoffeeIcon },
];

const categoryLabels: Record<Category, string> = {
  [Category.HOT_DISH]: '热菜',
  [Category.COLD_DISH]: '凉菜',
  [Category.SOUP]: '汤品',
  [Category.STAPLE]: '主食',
  [Category.DRINK]: '饮料',
};

const fetchDishes = async () => {
  try {
    dishes.value = await request.get('/dishes');
  } catch (err: any) {
    console.error(err);
    alert('加载菜单失败，请检查网络或后端服务');
  }
};

const filteredDishes = computed(() => {
  return dishes.value.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         dish.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchesCategory = activeCategory.value === 'ALL' || dish.category === activeCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedIds.value.length} 道菜品吗？`)) return;
  isLoading.value = true;
  try {
    // 假设后端支持批量删除，如果不支持则循环删除
    await Promise.all(selectedIds.value.map(id => request.delete(`/dishes/${id}`)));
    selectedIds.value = [];
    fetchDishes();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const deleteDish = async (id: string) => {
  if (!confirm('确定要从您的私藏菜单中移除这道菜吗？')) return;
  try {
    await request.delete(`/dishes/${id}`);
    fetchDishes();
  } catch (err) {
    console.error(err);
  }
};

const editDish = (dish: Dish) => {
  editingDishId.value = dish.id;
  dishForm.name = dish.name;
  dishForm.category = dish.category;
  dishForm.description = dish.description || '';
  dishForm.image = dish.image || '';
  dishForm.tags = [...dish.tags];
  tagsInput.value = dish.tags.join(', ');
  isAddModalOpen.value = true;
};

const saveDish = async () => {
  console.log('saveDish called', dishForm);
  if (!dishForm.name) {
    console.warn('saveDish validation failed');
    return;
  }
  
  isLoading.value = true;
  try {
    const payload = {
      ...dishForm,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    console.log('sending payload', payload);
    if (editingDishId.value) {
      await request.put(`/dishes/${editingDishId.value}`, payload);
      console.log('update success');
    } else {
      await request.post('/dishes', payload);
      console.log('create success');
    }
    
    closeModal();
    fetchDishes();
  } catch (err) {
    console.error('saveDish error', err);
    alert('保存失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  isAddModalOpen.value = false;
  editingDishId.value = null;
  dishForm.name = '';
  dishForm.description = '';
  dishForm.tags = [];
  tagsInput.value = '';
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // Check file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        dishForm.image = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
};

onMounted(fetchDishes);
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.1);
  border-radius: 10px;
}
</style>
