<template>
  <ChefModal :model-value="modelValue" title="批量导入私房菜" max-width="max-w-4xl" @update:model-value="close">
    <div class="space-y-6">
      <!-- Step 1: Upload -->
      <div v-if="step === 'upload'" class="space-y-4">
        <div class="bg-primary/5 rounded-xl p-4 flex items-start gap-3">
          <InfoIcon class="text-primary shrink-0 mt-0.5" :size="18" />
          <div class="text-sm text-text-muted space-y-1">
            <p class="font-bold text-text-dark">导入说明</p>
            <p>1. 请先下载模板文件，按照格式填写菜品信息。</p>
            <p>2. 支持批量导入菜品名称、分类、描述、标签和图片链接。</p>
            <p>3. 单次建议导入不超过 100 条数据。</p>
          </div>
        </div>

        <div 
          class="border-2 border-dashed border-primary/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <UploadCloudIcon :size="32" />
          </div>
          <div class="text-center">
            <p class="font-bold text-text-dark text-lg">点击或拖拽上传 Excel 文件</p>
            <p class="text-text-muted text-sm mt-1">支持 .xlsx, .xls 格式</p>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept=".xlsx, .xls" 
            class="hidden" 
            @change="handleFileChange"
          />
        </div>

        <div class="flex justify-center">
          <button @click="downloadTemplate" class="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
            <FileSpreadsheetIcon :size="16" />
            下载标准导入模板
          </button>
        </div>
      </div>

      <!-- Step 2: Preview -->
      <div v-if="step === 'preview'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex gap-4 text-sm">
            <span class="font-bold text-text-dark">解析结果</span>
            <span class="text-green-600 flex items-center gap-1"><CheckCircleIcon :size="14" /> {{ validCount }} 条有效</span>
            <span v-if="invalidCount > 0" class="text-red-500 flex items-center gap-1"><AlertCircleIcon :size="14" /> {{ invalidCount }} 条无效</span>
          </div>
          <button @click="step = 'upload'" class="text-xs text-text-muted hover:text-text-dark">重新上传</button>
        </div>

        <div class="border border-primary/10 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
          <table class="w-full text-sm text-left">
            <thead class="bg-primary/5 text-text-dark font-bold sticky top-0 z-10">
              <tr>
                <th class="p-3">状态</th>
                <th class="p-3">菜品名称</th>
                <th class="p-3">分类</th>
                <th class="p-3">标签</th>
                <th class="p-3 w-1/3">描述</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary/5">
              <tr v-for="(item, index) in parsedData" :key="index" :class="item.isValid ? 'bg-white' : 'bg-red-50'">
                <td class="p-3">
                  <span v-if="item.isValid" class="text-green-500"><CheckCircleIcon :size="16" /></span>
                  <div v-else class="text-red-500 group relative cursor-help">
                    <AlertCircleIcon :size="16" />
                    <div class="absolute left-6 top-0 bg-red-600 text-white text-xs p-2 rounded shadow-lg w-40 hidden group-hover:block z-20">
                      {{ item.errors.join(', ') }}
                    </div>
                  </div>
                </td>
                <td class="p-3 font-bold text-text-dark">{{ item.name || '-' }}</td>
                <td class="p-3">
                  <span class="px-2 py-1 bg-accent/20 rounded-md text-xs font-bold text-text-muted">
                    {{ categoryLabel(item.category) }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in item.tags" :key="tag" class="text-xs text-text-muted/60">#{{ tag }}</span>
                  </div>
                </td>
                <td class="p-3 text-text-muted truncate max-w-xs">{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="invalidCount > 0" class="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-xs text-red-600">
          <AlertCircleIcon :size="14" />
          <span>无效数据将被自动跳过，仅导入 {{ validCount }} 条有效数据。</span>
        </div>
      </div>

      <!-- Step 3: Result -->
      <div v-if="step === 'result'" class="py-10 flex flex-col items-center justify-center space-y-4 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-pop">
          <CheckCircleIcon :size="48" />
        </div>
        <div>
          <h3 class="text-2xl font-bold text-text-dark">导入完成</h3>
          <p class="text-text-muted mt-2">成功导入 {{ successCount }} 道菜品</p>
          <p v-if="failCount > 0" class="text-red-500 text-sm mt-1">{{ failCount }} 条导入失败</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button v-if="step !== 'result'" type="button" @click="close" class="px-6 py-2.5 text-sm font-bold text-text-dark/40 hover:text-text-dark transition-colors">取消</button>
        
        <ChefButton 
          v-if="step === 'preview'" 
          variant="primary" 
          @click="confirmImport" 
          :disabled="isImporting || validCount === 0"
        >
          {{ isImporting ? `导入中 (${progress}/${validCount})...` : `确认导入 (${validCount})` }}
        </ChefButton>
        
        <ChefButton 
          v-if="step === 'result'" 
          variant="primary" 
          @click="close"
        >
          完成
        </ChefButton>
      </div>
    </template>
  </ChefModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UploadCloudIcon, FileSpreadsheetIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-vue-next';
import ChefModal from '../../components/ChefModal.vue';
import ChefButton from '../../components/ChefButton.vue';
import { generateTemplate, parseExcel } from '../../utils/excel';
import type { ParsedDish } from '../../utils/excel';
import { Category } from '../../types';
import request from '../../api/request';
import { useToast } from '../../composables/useToast';

const toast = useToast();

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const step = ref<'upload' | 'preview' | 'result'>('upload');
const fileInput = ref<HTMLInputElement | null>(null);
const parsedData = ref<ParsedDish[]>([]);
const isImporting = ref(false);
const progress = ref(0);
const successCount = ref(0);
const failCount = ref(0);

const validCount = computed(() => parsedData.value.filter(d => d.isValid).length);
const invalidCount = computed(() => parsedData.value.filter(d => !d.isValid).length);

const categoryLabels: Record<Category, string> = {
  [Category.HOT_DISH]: '热菜',
  [Category.COLD_DISH]: '凉菜',
  [Category.SOUP]: '汤品',
  [Category.STAPLE]: '主食',
  [Category.DRINK]: '饮料',
};

const categoryLabel = (cat: Category) => categoryLabels[cat] || cat;

const close = () => {
  emit('update:modelValue', false);
  // Reset state after a short delay for animation
  setTimeout(() => {
    step.value = 'upload';
    parsedData.value = [];
    progress.value = 0;
  }, 300);
};

const downloadTemplate = () => {
  generateTemplate();
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files[0]) {
    processFile(files[0]);
  }
  // Reset input
  if (fileInput.value) fileInput.value.value = '';
};

const handleDrop = async (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    processFile(files[0]);
  }
};

const processFile = async (file: File) => {
  try {
    parsedData.value = await parseExcel(file);
    step.value = 'preview';
  } catch (err) {
    console.error(err);
    toast.error('解析文件失败，请检查文件格式是否正确');
  }
};

const confirmImport = async () => {
  const validItems = parsedData.value.filter(d => d.isValid);
  if (validItems.length === 0) return;

  isImporting.value = true;
  progress.value = 0;
  successCount.value = 0;
  failCount.value = 0;

  // Parallel requests with limit? Or sequential? 
  // Sequential is safer for order and server load.
  for (const item of validItems) {
    try {
      // Clean data for API
      const payload = {
        name: item.name,
        category: item.category,
        description: item.description,
        tags: item.tags,
        image: item.image
      };
      await request.post('/dishes', payload);
      successCount.value++;
    } catch (err) {
      console.error(`Failed to import ${item.name}`, err);
      failCount.value++;
    }
    progress.value++;
  }

  isImporting.value = false;
  step.value = 'result';
  emit('success');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 119, 6, 0.4);
}
</style>
