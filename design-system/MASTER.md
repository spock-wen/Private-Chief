# SpockChef Global Design System (MASTER)

## 1. 核心视觉理念 (Design Principles)
- **温暖 (Warm)**: 采用暖色调调色板，模拟家宴灯光。
- **专业 (Professional)**: 极致的排版、间距与顺滑的动效。
- **沉浸 (Immersive)**: 减少干扰，突出菜品图片与互动状态。

## 2. 调色板 (Color Palette)
| Token | Hex | 用途 |
|-------|-----|------|
| `primary` | `#D97706` | 琥珀金 (品牌色、主操作) |
| `accent` | `#FDE68A` | 奶油黄 (高亮、点缀) |
| `bg-base` | `#FFFBF0` | 暖米白 (背景色) |
| `text-dark` | `#431407` | 深褐 (标题、主要文字) |
| `text-muted` | `#92400E` | 琥珀褐 (次要说明、图标) |
| `success` | `#16A34A` | 森林绿 (已锁定、完成) |

## 3. 字体规范 (Typography)
- **标题**: `Serif` 类字体 (如 *Noto Serif SC*), 增加仪式感。
- **正文**: `Sans-serif` (如 *Inter* / *PingFang SC*), 确保清晰易读。
- **比例**: 
  - H1: 3rem (48px) - 首页标题
  - H2: 2rem (32px) - 页面标题
  - Body: 1rem (16px) - 标准正文

## 4. 空间与形状 (Layout & Shapes)
- **圆角**: 统一 `16px` (rounded-2xl) - 营造亲和力。
- **投影**: `shadow-warm` (基于琥珀色的弥散阴影)。
- **容器**: 最大宽度 `1280px` (max-w-7xl)。

## 5. 动效原则 (Motion)
- **进入**: `fade-in-up` (200ms, ease-out)。
- **反馈**: `active:scale-95` (按钮点击缩放)。
- **状态**: 投票点赞时的 `pop` 效果。

## 6. 组件规范 (Component Specs)
- **Card**: 背景 `white/80`，模糊 `backdrop-blur-md`，边框 `primary/10`。
- **Button**: 渐变或纯色琥珀金，文字白色，加粗。
- **Navbar**: 浮动设计，毛玻璃效果。
