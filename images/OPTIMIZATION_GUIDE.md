# 图片资源优化指南

## 文件大小要求

### TabBar 图标（必须小于40KB）
- `home.png` - 首页图标：**< 40KB**
- `home-active.png` - 首页选中图标：**< 40KB**
- `history.png` - 历史图标：**< 40KB**
- `history-active.png` - 历史选中图标：**< 40KB**

### 其他图片
- `logo.png` - Logo图片：**< 100KB**
- `default-dish.png` - 默认菜品图片：**< 200KB**

## 优化工具推荐

### 1. 在线压缩工具
- [TinyPNG](https://tinypng.com/) - 支持PNG/JPG压缩
- [Compressor.io](https://compressor.io/)
- [Squoosh](https://squoosh.app/) - Google出品，可预览压缩效果

### 2. 桌面软件
- Photoshop
- GIMP（免费）
- ImageOptim（Mac）

### 3. 命令行工具
- imagemin-cli
- optipng
- pngquant

## 压缩参数建议

### PNG格式
- 256色或更低
- 移除元数据
- 使用有损压缩（可接受范围内）

### JPEG格式
- 质量值设置为60-80
- 使用4:2:2色度子采样

## 替换步骤

1. 使用上述工具压缩图片
2. 确保压缩后的图片大小满足要求
3. 保持视觉质量在可接受范围内
4. 替换images目录下的原文件

## 检查清单

- [ ] `home.png` < 40KB
- [ ] `home-active.png` < 40KB
- [ ] `history.png` < 40KB
- [ ] `history-active.png` < 40KB
- [ ] `logo.png` < 100KB
- [ ] `default-dish.png` < 200KB