import * as XLSX from 'xlsx';
import { Category } from '../types';
import type { Dish } from '../types';

export interface ExcelDishRow {
  菜品名称: string;
  分类: string;
  描述?: string;
  标签?: string;
  图片链接?: string;
}

export interface ParsedDish extends Omit<Dish, 'id' | 'createdAt' | 'updatedAt'> {
  isValid: boolean;
  errors: string[];
}

const CATEGORY_MAP: Record<string, Category> = {
  '热菜': Category.HOT_DISH,
  '凉菜': Category.COLD_DISH,
  '汤品': Category.SOUP,
  '主食': Category.STAPLE,
  '饮料': Category.DRINK,
  'HOT_DISH': Category.HOT_DISH,
  'COLD_DISH': Category.COLD_DISH,
  'SOUP': Category.SOUP,
  'STAPLE': Category.STAPLE,
  'DRINK': Category.DRINK,
};

// 移除未使用的变量
// const CATEGORY_LABEL_MAP: Record<Category, string> = {
//   [Category.HOT_DISH]: '热菜',
//   [Category.COLD_DISH]: '凉菜',
//   [Category.SOUP]: '汤品',
//   [Category.STAPLE]: '主食',
//   [Category.DRINK]: '饮料',
// };

export const generateTemplate = () => {
  const headers = ['菜品名称', '分类', '描述', '标签', '图片链接'];
  const example = [
    ['红烧肉', '热菜', '经典本帮菜，肥而不腻', '招牌, 必点', 'https://example.com/image.jpg'],
    ['拍黄瓜', '凉菜', '清爽开胃', '素食, 辣', ''],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
  
  // Add data validation for Category column (Column B) if possible, but basic template is enough.
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '批量导入模板');
  XLSX.writeFile(wb, '私房菜导入模板.xlsx');
};

export const parseExcel = async (file: File): Promise<ParsedDish[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('Excel文件中没有工作表');
        }
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          throw new Error('无法读取工作表数据');
        }
        const json = XLSX.utils.sheet_to_json<ExcelDishRow>(worksheet);
        
        const parsedDishes: ParsedDish[] = json.map(row => {
          const errors: string[] = [];
          
          // Validate Name
          const name = row['菜品名称']?.trim();
          if (!name) {
            errors.push('缺少菜品名称');
          }

          // Validate and Map Category
          let category: Category = Category.HOT_DISH;
          const catRaw = row['分类']?.trim();
          if (catRaw && CATEGORY_MAP[catRaw]) {
            category = CATEGORY_MAP[catRaw];
          } else if (catRaw) {
             // Try fuzzy match or default
             const found = Object.keys(CATEGORY_MAP).find(k => k.includes(catRaw));
             if (found && CATEGORY_MAP[found]) {
               category = CATEGORY_MAP[found];
             } else {
               errors.push(`未知分类: ${catRaw}`);
             }
          } else {
            errors.push('缺少分类');
          }

          // Parse Tags
          const tags = row['标签'] ? row['标签'].toString().split(/[,，、]/).map(t => t.trim()).filter(Boolean) : [];

          return {
            name: name || '',
            category,
            description: row['描述'] || '',
            image: row['图片链接'] || '',
            tags,
            isValid: errors.length === 0,
            errors
          };
        });
        
        resolve(parsedDishes);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
