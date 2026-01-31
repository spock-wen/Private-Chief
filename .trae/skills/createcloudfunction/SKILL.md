---
name: CreateCloudFunction
description: "`CreateCloudFunction` Skill 用于快速创建一个符合微信云开发规范的云函数目录结构，包含初始化好的入口文件和依赖配置文件。"
---

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