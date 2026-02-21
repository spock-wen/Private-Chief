---
name: ui-ux-pro-max
description: "UI/UX 设计智能。50 种风格，21 种调色板，50 种字体搭配，20 种图表，9 种技术栈（React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui）。操作：规划、构建、创建、设计、实现、审查、修复、改进、优化、增强、重构、检查 UI/UX 代码。项目：网站、着陆页、仪表板、管理面板、电子商务、SaaS、作品集、博客、移动应用、.html, .tsx, .vue, .svelte。元素：按钮、模态框、导航栏、侧边栏、卡片、表格、表单、图表。风格：玻璃拟态、黏土拟态、极简主义、粗野主义、新拟态、Bento 网格、暗黑模式、响应式、拟物化、扁平化设计。主题：调色板、可访问性、动画、布局、排版、字体搭配、间距、悬停、阴影、渐变。集成：用于组件搜索和示例的 shadcn/ui MCP。"
---

# UI/UX Pro Max - 设计智能

针对 Web 和移动应用的综合设计指南。包含 9 种技术栈中的 50+ 种风格、97 种调色板、57 种字体搭配、99 条 UX 指南和 25 种图表类型。具有基于优先级的推荐的可搜索数据库。

## 何时应用 (When to Apply)

在以下情况参考这些指南：
- 设计新的 UI 组件或页面
- 选择调色板和排版
- 审查代码中的 UX 问题
- 构建着陆页或仪表板
- 实现可访问性要求

## 按优先级分类的规则 (Rule Categories by Priority)

| 优先级 | 类别 | 影响 | 领域 |
|--------|------|------|------|
| 1 | 可访问性 (Accessibility) | 关键 (CRITICAL) | `ux` |
| 2 | 触摸与交互 (Touch & Interaction) | 关键 (CRITICAL) | `ux` |
| 3 | 性能 (Performance) | 高 (HIGH) | `ux` |
| 4 | 布局与响应式 (Layout & Responsive) | 高 (HIGH) | `ux` |
| 5 | 排版与颜色 (Typography & Color) | 中 (MEDIUM) | `typography`, `color` |
| 6 | 动画 (Animation) | 中 (MEDIUM) | `ux` |
| 7 | 风格选择 (Style Selection) | 中 (MEDIUM) | `style`, `product` |
| 8 | 图表与数据 (Charts & Data) | 低 (LOW) | `chart` |

## 快速参考 (Quick Reference)

### 1. 可访问性 (Accessibility) (关键)

- `color-contrast` - 普通文本的对比度至少为 4.5:1
- `focus-states` - 交互元素上有可见的焦点环
- `alt-text` - 为有意义的图像提供描述性替代文本
- `aria-labels` - 为仅图标按钮提供 aria-label
- `keyboard-nav` - Tab 顺序与视觉顺序匹配
- `form-labels` - 使用带有 for 属性的 label

### 2. 触摸与交互 (Touch & Interaction) (关键)

- `touch-target-size` - 最小 44x44px 的触摸目标
- `hover-vs-tap` - 主要交互使用点击/轻触
- `loading-buttons` - 在异步操作期间禁用按钮
- `error-feedback` - 在问题附近显示清晰的错误消息
- `cursor-pointer` - 为可点击元素添加 cursor-pointer

### 3. 性能 (Performance) (高)

- `image-optimization` - 使用 WebP, srcset, 懒加载
- `reduced-motion` - 检查 prefers-reduced-motion
- `content-jumping` - 为异步内容预留空间

### 4. 布局与响应式 (Layout & Responsive) (高)

- `viewport-meta` - width=device-width initial-scale=1
- `readable-font-size` - 移动设备上正文文本最小 16px
- `horizontal-scroll` - 确保内容适应视口宽度
- `z-index-management` - 定义 z-index 标度 (10, 20, 30, 50)

### 5. 排版与颜色 (Typography & Color) (中)

- `line-height` - 正文文本使用 1.5-1.75
- `line-length` - 每行限制在 65-75 个字符
- `font-pairing` - 匹配标题/正文字体的个性

### 6. 动画 (Animation) (中)

- `duration-timing` - 微交互使用 150-300ms
- `transform-performance` - 使用 transform/opacity，而不是 width/height
- `loading-states` - 骨架屏或加载指示器

### 7. 风格选择 (Style Selection) (中)

- `style-match` - 将风格与产品类型匹配
- `consistency` - 在所有页面使用相同的风格
- `no-emoji-icons` - 使用 SVG 图标，而不是 emoji

### 8. 图表与数据 (Charts & Data) (低)

- `chart-type` - 将图表类型与数据类型匹配
- `color-guidance` - 使用无障碍调色板
- `data-table` - 提供表格替代方案以实现可访问性

## 如何使用 (How to Use)

使用下面的 CLI 工具搜索特定领域。

---

## 先决条件 (Prerequisites)

检查是否安装了 Python：

```bash
python3 --version || python --version
```

如果未安装 Python，请根据用户的操作系统进行安装：

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## 如何使用此技能 (How to Use This Skill)

当用户请求 UI/UX 工作（设计、构建、创建、实现、审查、修复、改进）时，请遵循此工作流程：

### 第一步：分析用户需求 (Step 1: Analyze User Requirements)

从用户请求中提取关键信息：
- **产品类型 (Product type)**：SaaS、电子商务、作品集、仪表板、着陆页等。
- **风格关键词 (Style keywords)**：极简、俏皮、专业、优雅、暗黑模式等。
- **行业 (Industry)**：医疗保健、金融科技、游戏、教育等。
- **技术栈 (Stack)**：React, Vue, Next.js, 或默认为 `html-tailwind`

### 第二步：生成设计系统 (REQUIRED) (Step 2: Generate Design System)

**始终以 `--design-system` 开始**以获得带有理由的全面建议：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

此命令：
1. 并行搜索 5 个领域（产品、风格、颜色、着陆页、排版）
2. 应用 `ui-reasoning.csv` 中的推理规则以选择最佳匹配
3. 返回完整的设计系统：模式、风格、颜色、排版、效果
4. 包括要避免的反模式

**示例：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### 第 2b 步：持久化设计系统 (Master + Overrides Pattern) (Step 2b: Persist Design System)

要为**跨会话的分层检索**保存设计系统，请添加 `--persist`：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

这将创建：
- `design-system/MASTER.md` — 包含所有设计规则的全局真实来源
- `design-system/pages/` — 页面特定覆盖的文件夹

**使用页面特定覆盖：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

这也将创建：
- `design-system/pages/dashboard.md` — 页面特定于 Master 的偏差

**分层检索如何工作：**
1. 构建特定页面（例如“Checkout”）时，首先检查 `design-system/pages/checkout.md`
2. 如果页面文件存在，其规则**覆盖** Master 文件
3. 如果不存在，仅使用 `design-system/MASTER.md`

**上下文感知检索提示：**
```
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

### 第三步：根据需要补充详细搜索 (Step 3: Supplement with Detailed Searches)

获得设计系统后，使用领域搜索获取更多详细信息：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**何时使用详细搜索：**

| 需求 | 领域 | 示例 |
|------|------|------|
| 更多风格选项 | `style` | `--domain style "glassmorphism dark"` |
| 图表建议 | `chart` | `--domain chart "real-time dashboard"` |
| UX 最佳实践 | `ux` | `--domain ux "animation accessibility"` |
| 替代字体 | `typography` | `--domain typography "elegant luxury"` |
| 着陆页结构 | `landing` | `--domain landing "hero social-proof"` |

### 第四步：技术栈指南 (默认: html-tailwind) (Step 4: Stack Guidelines)

获取特定于实现的最佳实践。如果用户未指定技术栈，**默认为 `html-tailwind`**。

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack html-tailwind
```

可用技术栈：`html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## 搜索参考 (Search Reference)

### 可用领域 (Available Domains)

| 领域 | 用途 | 示例关键词 |
|------|------|------------|
| `product` | 产品类型建议 | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI 风格、颜色、效果 | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | 字体搭配、Google Fonts | elegant, playful, professional, modern |
| `color` | 按产品类型的调色板 | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| `ux` | 最佳实践、反模式 | animation, accessibility, z-index, loading |
| `react` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | Web interface guidelines | aria, focus, keyboard, semantic, virtualize |
| `prompt` | AI 提示词、CSS 关键词 | (style name) |

### 可用技术栈 (Available Stacks)

| Stack | Focus |
|-------|-------|
| `html-tailwind` | Tailwind utilities, responsive, a11y (DEFAULT) |
| `react` | State, hooks, performance, patterns |
| `nextjs` | SSR, routing, images, API routes |
| `vue` | Composition API, Pinia, Vue Router |
| `svelte` | Runes, stores, SvelteKit |
| `swiftui` | Views, State, Navigation, Animation |
| `react-native` | Components, Navigation, Lists |
| `flutter` | Widgets, State, Layout, Theming |
| `shadcn` | shadcn/ui components, theming, forms, patterns |
| `jetpack-compose` | Composables, Modifiers, State Hoisting, Recomposition |

---

## 示例工作流程 (Example Workflow)

**用户请求：** "Làm landing page cho dịch vụ chăm sóc da chuyên nghiệp"

### 第一步：分析需求
- 产品类型：美容/水疗服务
- 风格关键词：优雅、专业、柔和
- 行业：美容/健康
- 技术栈：html-tailwind (默认)

### 第二步：生成设计系统 (REQUIRED)

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service elegant" --design-system -p "Serenity Spa"
```

**输出：** 包含模式、风格、颜色、排版、效果和反模式的完整设计系统。

### 第三步：根据需要补充详细搜索

```bash
# 获取动画和可访问性的 UX 指南
python3 skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux

# 如果需要，获取替代排版选项
python3 skills/ui-ux-pro-max/scripts/search.py "elegant luxury serif" --domain typography
```

### 第四步：技术栈指南

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack html-tailwind
```

**然后：** 综合设计系统 + 详细搜索并实现设计。

---

## 输出格式 (Output Formats)

`--design-system` 标志支持两种输出格式：

```bash
# ASCII 框 (默认) - 最适合终端显示
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - 最适合文档
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## 获得更好结果的提示 (Tips for Better Results)

1. **关键词要具体** - "healthcare SaaS dashboard" > "app"
2. **多次搜索** - 不同的关键词揭示不同的见解
3. **结合领域** - 风格 + 排版 + 颜色 = 完整的设计系统
4. **始终检查 UX** - 搜索 "animation", "z-index", "accessibility" 以查找常见问题
5. **使用技术栈标志** - 获取特定于实现的最佳实践
6. **迭代** - 如果第一次搜索不匹配，请尝试不同的关键词

---

## 专业 UI 的通用规则 (Common Rules for Professional UI)

这些是使 UI 看起来不专业的常见被忽视的问题：

### 图标与视觉元素 (Icons & Visual Elements)

| 规则 | 应该 (Do) | 不应该 (Don't) |
|------|-----------|----------------|
| **无 Emoji 图标** | 使用 SVG 图标 (Heroicons, Lucide, Simple Icons) | 使用 🎨 🚀 ⚙️ 等 emoji 作为 UI 图标 |
| **稳定的悬停状态** | 在悬停时使用颜色/不透明度过渡 | 使用改变布局的缩放变换 |
| **正确的品牌 Logo** | 从 Simple Icons 搜索官方 SVG | 猜测或使用不正确的 Logo 路径 |
| **一致的图标大小** | 使用固定的 viewBox (24x24) 和 w-6 h-6 | 随机混合不同的图标大小 |

### 交互与光标 (Interaction & Cursor)

| 规则 | 应该 (Do) | 不应该 (Don't) |
|------|-----------|----------------|
| **光标指针** | 为所有可点击/可悬停的卡片添加 `cursor-pointer` | 在交互元素上保留默认光标 |
| **悬停反馈** | 提供视觉反馈（颜色、阴影、边框） | 没有元素是交互式的指示 |
| **平滑过渡** | 使用 `transition-colors duration-200` | 瞬间状态变化或太慢 (>500ms) |

### 亮/暗模式对比度 (Light/Dark Mode Contrast)

| 规则 | 应该 (Do) | 不应该 (Don't) |
|------|-----------|----------------|
| **亮模式玻璃卡片** | 使用 `bg-white/80` 或更高的不透明度 | 使用 `bg-white/10` (太透明) |
| **亮模式文本对比度** | 文本使用 `#0F172A` (slate-900) | 正文文本使用 `#94A3B8` (slate-400) |
| **亮模式柔和文本** | 最低使用 `#475569` (slate-600) | 使用 gray-400 或更浅 |
| **边框可见性** | 在亮模式下使用 `border-gray-200` | 使用 `border-white/10` (不可见) |

### 布局与间距 (Layout & Spacing)

| 规则 | 应该 (Do) | 不应该 (Don't) |
|------|-----------|----------------|
| **浮动导航栏** | 添加 `top-4 left-4 right-4` 间距 | 将导航栏粘在 `top-0 left-0 right-0` |
| **内容填充** | 考虑固定导航栏的高度 | 让内容隐藏在固定元素后面 |
| **一致的最大宽度** | 使用相同的 `max-w-6xl` 或 `max-w-7xl` | 混合不同的容器宽度 |

---

## 交付前检查清单 (Pre-Delivery Checklist)

在交付 UI 代码之前，请验证这些项目：

### 视觉质量
- [ ] 不使用 emoji 作为图标（改用 SVG）
- [ ] 所有图标来自一致的图标集 (Heroicons/Lucide)
- [ ] 品牌 Logo 正确（从 Simple Icons 验证）
- [ ] 悬停状态不会导致布局偏移
- [ ] 直接使用主题颜色 (bg-primary) 而不是 var() 包装器

### 交互
- [ ] 所有可点击元素都有 `cursor-pointer`
- [ ] 悬停状态提供清晰的视觉反馈
- [ ] 过渡平滑 (150-300ms)
- [ ] 键盘导航的焦点状态可见

### 亮/暗模式
- [ ] 亮模式文本具有足够的对比度（最低 4.5:1）
- [ ] 玻璃/透明元素在亮模式下可见
- [ ] 边框在两种模式下均可见
- [ ] 在交付前测试两种模式

### 布局
- [ ] 浮动元素与边缘有适当的间距
- [ ] 没有内容隐藏在固定导航栏后面
- [ ] 在 375px, 768px, 1024px, 1440px 下响应式
- [ ] 移动设备上无水平滚动

### 可访问性
- [ ] 所有图像都有 alt 文本
- [ ] 表单输入有 label
- [ ] 颜色不是唯一的指示器
- [ ] 遵守 `prefers-reduced-motion`
