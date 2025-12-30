# 图片资源目录

此目录用于存放小程序使用的图片资源。

## 必需的图片文件

请在此目录下放置以下图片文件：

1. **logo.png** - 小程序Logo（建议尺寸：256x256px）
2. **home.png** - 首页图标（TabBar，建议尺寸：81x81px）
3. **home-active.png** - 首页选中图标（TabBar，建议尺寸：81x81px）
4. **history.png** - 历史图标（TabBar，建议尺寸：81x81px）
5. **history-active.png** - 历史选中图标（TabBar，建议尺寸：81x81px）
6. **default-dish.png** - 默认菜品图片（建议尺寸：400x400px）

## 图片格式建议

- 使用 PNG 格式，支持透明背景
- 使用 WebP 格式可以减小文件大小（小程序支持）
- TabBar 图标建议使用单色图标

## 图片优化建议

- 压缩图片以减少小程序包体积
- TabBar 图标建议使用 iconfont 或 SVG 转换为 PNG
- 菜品图片建议使用云存储，通过 URL 引用

## 临时解决方案

如果暂时没有图片资源，可以：
1. 使用在线图标库（如 iconfont）生成图标
2. 使用占位图生成工具
3. 在代码中使用文本或 emoji 临时替代


