# 推荐的小程序开发 Skills

本文档详细介绍了三个推荐用于微信小程序开发的 Trae Skill。这些 Skill 旨在将繁琐的文件创建和配置过程自动化，从而显著提升开发效率。

## 1. 页面生成器 (CreatePage)

### Skill 概览
*   **名称**: `CreatePage`
*   **适用场景**: 当你需要添加一个新的小程序页面时。
*   **复杂度**: ⭐⭐ (涉及文件创建及 JSON 配置修改)

### 作用说明
`CreatePage` Skill 用于一键生成微信小程序页面所需的四个基础文件（`.wxml`, `.wxss`, `.js`, `.json`），并自动将新页面的路径注册到项目根目录下的 `app.json` 配置文件中。

### 解决了什么问题
*   **消除重复劳动**: 手动创建页面需要右键新建文件夹，再分别新建 4 个文件，过程机械且耗时。
*   **防止配置遗漏**: 经常有开发者创建了文件却忘记在 `app.json` 中注册，导致页面无法访问或报错。此 Skill 保证了注册步骤的原子性。

### 建议实现逻辑
1.  **输入**: 接收用户提供的页面名称（例如 `order-detail`）。
2.  **目录创建**: 在 `pages/` 目录下创建一个同名文件夹。
3.  **文件生成**:
    *   `[name].js`: 生成包含 `Page({})` 构造器及常用生命周期函数（onLoad, onShow 等）的模板代码。
    *   `[name].json`: 生成基础配置 `{ "usingComponents": {}, "navigationBarTitleText": "新页面" }`。
    *   `[name].wxml`: 生成包含基础容器 `<view class="container">...</view>` 的结构。
    *   `[name].wxss`: 生成空白或基础样式文件。
4.  **配置注册**: 读取 `app.json`，解析 JSON 内容，将 `pages/[name]/[name]` 路径追加到 `pages` 数组中，并写回文件。

---

## 2. 云函数生成器 (CreateCloudFunction)

### Skill 概览
*   **名称**: `CreateCloudFunction`
*   **适用场景**: 当你需要编写新的后端逻辑（如数据库操作、API 调用）时。
*   **复杂度**: ⭐ (主要涉及文件和目录创建)

### 作用说明
`CreateCloudFunction` Skill 用于快速创建一个符合微信云开发规范的云函数目录结构，包含初始化好的入口文件和依赖配置文件。

### 解决了什么问题
*   **规范统一**: 确保所有云函数都正确引入了 `wx-server-sdk` 并进行了 `cloud.init()` 初始化。
*   **快速启动**: 开发者可以直接开始编写业务逻辑，无需处理繁琐的样板代码。

### 建议实现逻辑
1.  **输入**: 接收用户提供的云函数名称（例如 `getUserData`）。
2.  **目录创建**: 在 `cloudfunctions/` 目录下创建一个同名文件夹。
3.  **文件生成**:
    *   `index.js`: 生成标准入口代码：
        ```javascript
        const cloud = require('wx-server-sdk')
        cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
        exports.main = async (event, context) => {
          const wxContext = cloud.getWXContext()
          return {
            event,
            openid: wxContext.OPENID,
            appid: wxContext.APPID,
            unionid: wxContext.UNIONID,
          }
        }
        ```
    *   `package.json`: 生成包含 `wx-server-sdk` 依赖的配置，方便后续安装依赖。

---

## 3. 组件生成器 (CreateComponent)

### Skill 概览
*   **名称**: `CreateComponent`
*   **适用场景**: 当你需要封装可复用的 UI 模块（如卡片、弹窗、导航栏）时。
*   **复杂度**: ⭐ (涉及文件创建)

### 作用说明
`CreateComponent` Skill 用于快速生成微信小程序自定义组件的标准文件结构。它与页面生成器类似，但生成的内容针对组件进行了调整。

### 解决了什么问题
*   **区分上下文**: 组件的 `.js` 文件使用 `Component` 构造器，而页面使用 `Page` 构造器。
*   **配置自动化**: 组件的 `.json` 文件必须包含 `"component": true` 字段，手动创建容易忽略。

### 建议实现逻辑
1.  **输入**: 接收用户提供的组件名称（例如 `dish-card`）。
2.  **目录创建**: 默认在 `components/` 目录下（如果不存在则创建）生成同名文件夹。
3.  **文件生成**:
    *   `[name].json`: 写入 `{ "component": true, "usingComponents": {} }`。
    *   `[name].js`: 生成包含 `Component({})` 构造器、`properties`、`data`、`methods` 的标准结构。
    *   `[name].wxml`: 生成组件的基础模板。
    *   `[name].wxss`: 生成组件的基础样式。
