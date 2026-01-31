---
name: CreateComponent
description: "`CreateComponent` Skill 用于快速生成微信小程序自定义组件的标准文件结构。它与页面生成器类似，但生成的内容针对组件进行了调整。"
---

1.  **输入**: 接收用户提供的组件名称（例如 `dish-card`）。
2.  **目录创建**: 默认在 `components/` 目录下（如果不存在则创建）生成同名文件夹。
3.  **文件生成**:
    *   `[name].json`: 写入 `{ "component": true, "usingComponents": {} }`。
    *   `[name].js`: 生成包含 `Component({})` 构造器、`properties`、`data`、`methods` 的标准结构。
    *   `[name].wxml`: 生成组件的基础模板。
    *   `[name].wxss`: 生成组件的基础样式。