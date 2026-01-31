---
name: CreatePage
description: "`CreatePage` Skill 用于一键生成微信小程序页面所需的四个基础文件（`.wxml`, `.wxss`, `.js`, `.json`），并自动将新页面的路径注册到项目根目录下的 `app.json` 配置文件"
---

1.  **输入**: 接收用户提供的页面名称（例如 `order-detail`）。
2.  **目录创建**: 在 `pages/` 目录下创建一个同名文件夹。
3.  **文件生成**:
    *   `[name].js`: 生成包含 `Page({})` 构造器及常用生命周期函数（onLoad, onShow 等）的模板代码。
    *   `[name].json`: 生成基础配置 `{ "usingComponents": {}, "navigationBarTitleText": "新页面" }`。
    *   `[name].wxml`: 生成包含基础容器 `<view class="container">...</view>` 的结构。
    *   `[name].wxss`: 生成空白或基础样式文件。
4.  **配置注册**: 读取 `app.json`，解析 JSON 内容，将 `pages/[name]/[name]` 路径追加到 `pages` 数组中，并写回文件。