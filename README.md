# Private Chef - 私厨家宴助手

一个为家庭聚餐设计的数字化助手，帮助您轻松管理菜单、投票和结算。

## 🚀 快速开始

### 1. 启动服务

```bash
# 启动后端
cd background
npm run start:dev

# 启动前端（新终端）
cd front
npm run dev
```

### 2. 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8070/api

### 3. 登录测试

#### 方式一：手机号登录（推荐）
```
手机号：13800138000
验证码：123456（固定）
```

#### 方式二：使用测试账号
```
邮箱：test@example.com
密码：Test123456
```

## ⚠️ 重要说明

### 关于验证码

**验证码是模拟的，不会真实发送到手机！**

- ✅ 这是开发环境的正常行为
- 🔑 验证码固定为：**123456**
- 📱 手机不会收到短信（这是预期的）
- 💡 生产环境需要对接真实短信服务

详细说明请查看：[验证码使用指南](./VERIFICATION_CODE_GUIDE.md)

### 关于注册

如果注册时遇到问题：
1. 打开浏览器开发者工具（F12）查看错误
2. 检查后端是否正常运行
3. 尝试使用手机号登录（更简单）
4. 查看 [FAQ.md](./FAQ.md) 获取帮助

## 📚 文档

### 快速导航
- 📖 [完整文档导航](./docs/README.md) - 所有文档的入口
- 📋 [快速参考](./docs/QUICK_REFERENCE.md) - 常用文档和命令速查

### 常用文档
- 💻 [开发指南](./docs/02-development/DEV_GUIDE.md) - 开发环境搭建和使用
- 📱 [产品需求文档](./docs/01-product/PRD.md) - 产品功能和需求
- 🧪 [测试指南](./docs/03-testing/TESTING_GUIDE.md) - 测试编写和运行
- ❓ [常见问题](./docs/01-product/FAQ.md) - 问题解答和排查
- 📏 [项目规范](./docs/02-development/PROJECT_STANDARDS.md) - 代码规范和最佳实践

### 按角色查找
- 🆕 **新成员**: [开发指南](./docs/02-development/DEV_GUIDE.md) → [项目规范](./docs/02-development/PROJECT_STANDARDS.md) → [PRD](./docs/01-product/PRD.md)
- 👨‍💻 **开发者**: [开发指南](./docs/02-development/DEV_GUIDE.md) → [测试指南](./docs/03-testing/TESTING_GUIDE.md) → [API检查](./docs/02-development/API_CONSISTENCY_CHECK.md)
- 🧪 **测试**: [测试指南](./docs/03-testing/TESTING_GUIDE.md) → [测试用例](./docs/03-testing/TEST_CASES.md)
- 👨‍💼 **产品**: [PRD](./docs/01-product/PRD.md) → [UX分析](./docs/01-product/PRODUCT_UX_ANALYSIS.md) → [FAQ](./docs/01-product/FAQ.md)

## 🧪 测试 API

运行自动化测试脚本：

```bash
bash test-api.sh
```

测试内容：
- ✅ Session 初始化
- ✅ 用户注册
- ✅ 用户登录
- ✅ 发送验证码
- ✅ 获取用户信息
- ✅ 创建家庭
- ✅ 获取家庭列表

## 🏗️ 项目结构

```
Private chef/
├── background/          # NestJS 后端
│   ├── src/
│   │   ├── auth/       # 认证模块
│   │   ├── families/   # 家庭管理
│   │   ├── dishes/     # 菜品管理
│   │   ├── tables/     # 餐桌管理
│   │   ├── guests/     # 客人管理
│   │   ├── votes/      # 投票管理
│   │   └── sessions/   # 会话管理
│   └── prisma/         # 数据库 Schema
├── front/              # Vue 前端
│   └── src/
│       ├── views/      # 页面组件
│       ├── components/ # 通用组件
│       ├── stores/     # Pinia 状态管理
│       ├── api/        # API 请求
│       └── router/     # 路由配置
└── miniprogram/        # 微信小程序（独立）
```

## ✨ 主要功能

- 👥 **家庭管理** - 创建家庭，邀请成员
- 🍽️ **菜品库** - 管理家庭菜品，支持导入导出
- 🎯 **餐桌投票** - 创建餐桌，成员投票选菜
- 📊 **热力图** - 可视化投票结果
- 💰 **智能结算** - 自动计算费用分摊
- 📱 **多端支持** - Web + 微信小程序

## 🔧 技术栈

### 后端
- NestJS - Node.js 框架
- Prisma - ORM
- SQLite - 数据库
- JWT - 认证
- WebSocket - 实时通信

### 前端
- Vue 3 - 前端框架
- Vite - 构建工具
- Pinia - 状态管理
- Vue Router - 路由
- Tailwind CSS - 样式

## 📝 开发说明

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 后端
cd background
npm install

# 前端
cd front
npm install
```

### 数据库迁移

```bash
cd background
npx prisma migrate dev
```

### 环境变量

后端需要配置 `.env` 文件：
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=8070
```

## 🐛 常见问题

### Q: 为什么手机收不到验证码？
A: 这是正常的！开发环境使用模拟验证码（123456），不会真实发送短信。

### Q: 注册后报错怎么办？
A: 
1. 检查浏览器控制台（F12）
2. 确认后端服务正常运行
3. 尝试使用手机号登录
4. 查看 [FAQ](./docs/01-product/FAQ.md)

### Q: 如何查看后端日志？
A: 后端日志会实时显示在启动后端的终端窗口中。

### Q: 端口被占用怎么办？
A: 修改 `background/src/main.ts` 中的端口号，或关闭占用端口的程序。

## 📞 获取帮助

遇到问题？
1. 查看 [常见问题](./docs/01-product/FAQ.md)
2. 查看 [开发指南](./docs/02-development/DEV_GUIDE.md)
3. 查看 [完整文档导航](./docs/README.md)
4. 检查浏览器控制台和后端日志

## 📄 许可证

[MIT License](LICENSE)

---

**提示**：这是开发环境配置，生产环境部署前需要：
- 对接真实的短信服务
- 配置生产数据库
- 设置环境变量和密钥
- 配置 HTTPS 和域名

