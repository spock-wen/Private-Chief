import { Category } from '../types';
import type { Dish } from '../types';

export interface CSVDishRow {
  name: string;
  category: string;
  description?: string;
  tags?: string;
  image?: string;
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

const CATEGORY_LABEL_MAP: Record<Category, string> = {
  [Category.HOT_DISH]: '热菜',
  [Category.COLD_DISH]: '凉菜',
  [Category.SOUP]: '汤品',
  [Category.STAPLE]: '主食',
  [Category.DRINK]: '饮料',
};

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

export const generateTemplate = () => {
  const headers = ['name', 'category', 'description', 'tags', 'image'];
  const example = [
    '红烧肉,HOT_DISH,经典本帮菜，肥而不腻,招牌|必点,https://example.com/image.jpg',
    '拍黄瓜,COLD_DISH,清爽开胃,素食|辣,',
  ];
  
  const csvContent = [headers.join(','), ...example].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', '私房菜导入模板.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = async (file: File): Promise<ParsedDish[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
          throw new Error('CSV文件中没有数据');
        }
        
        const headers = parseCsvLine(lines[0]);
        const parsedDishes: ParsedDish[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          if (values.length !== headers.length) continue;
          
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          const errors: string[] = [];
          
          const name = row['name']?.trim();
          if (!name) {
            errors.push('缺少菜品名称');
          }
          
          let category: Category = Category.HOT_DISH;
          const catRaw = row['category']?.trim();
          if (catRaw && CATEGORY_MAP[catRaw]) {
            category = CATEGORY_MAP[catRaw];
          } else if (catRaw) {
            const found = Object.keys(CATEGORY_MAP).find(k => k.includes(catRaw));
            if (found && CATEGORY_MAP[found]) {
              category = CATEGORY_MAP[found];
            } else {
              errors.push(`未知分类: ${catRaw}`);
            }
          } else {
            errors.push('缺少分类');
          }
          
          const tags = row['tags'] ? row['tags'].split('|').map(t => t.trim()).filter(Boolean) : [];
          
          parsedDishes.push({
            name: name || '',
            category,
            description: row['description'] || '',
            image: row['image'] || '',
            tags,
            isValid: errors.length === 0,
            errors
          });
        }
        
        resolve(parsedDishes);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file, 'UTF-8');
  });
};

export const exportDishes = (dishes: Dish[], filename: string = '私房菜菜单') => {
  const headers = ['name', 'category', 'description', 'tags', 'image'];
  const csvContent = [
    headers.join(','),
    ...dishes.map(dish => {
      const name = escapeCsvField(dish.name);
      const category = escapeCsvField(CATEGORY_LABEL_MAP[dish.category]);
      const description = escapeCsvField(dish.description || '');
      const tags = escapeCsvField(dish.tags.join('|'));
      const image = escapeCsvField(dish.image || '');
      return `${name},${category},${description},${tags},${image}`;
    })
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};