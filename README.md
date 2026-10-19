# SYUCT ACM 官方平台 (SYUCTACM)

沈阳化工大学 ACM-ICPC 集训队官方网站与数字化服务平台。

- **组织主页**: [https://github.com/syuctacm](https://github.com/syuctacm)
- **核心评测**: [https://oj.syuctacm.cn](https://oj.syuctacm.cn)

---

## 🛠️ 技术架构

本项目采用标准的前后端分离架构，深度参考并升级了中国科大 LUG 的学术极客工程美学：

- **前端 (`web/`)**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Marked
- **后端 (`server/`)**: Go 1.24+ (Gin 框架 + GORM ORM + pgx 驱动 + JWT 鉴权)
- **数据库**: PostgreSQL 16+
- **部署模式**: Docker Compose 全容器化一键部署 (Postgres + Server + Web Nginx)

---

## 🏛️ 页面设计与中枢架构 (USTCLUG 风格)

1. **Header 导航**: Logo + 极简导航 (首页 / 核心服务 / 最新文章 / 薪火相传 / 训练 OJ) + 成员中心登录状态
2. **Hero 大图景深横幅**: `SYUCT @ ACM` 庄重大气标语与快速 CTA
3. **三段式核心中枢带 (Central Hub)**:
   - **左侧 4 宫格**: Hydro OJ 核心评测、题目标签榜、薪火相传（学长经验与路线）、历届选拔赛
   - **中间卡片**: 集训队官方简介 + 实时天气小挂件与 OJ 状态监视
   - **右侧 4 宫格**: 活动日历、招新通道、荣誉殿堂、友情链接 (CF/AtCoder/牛客/洛谷)
4. **最新文章流 (Article Stream)**:
   - 后台动态管理，支持分类筛选（新闻动态、集训通知、竞赛喜报、薪火相传）
   - 内置带 TOC 目录大纲的 Markdown 沉浸式阅读器
   - 管理员在线发布、编辑、置顶与删除能力
5. **深色极客 Footer**: 协会简介、联系方式、官方邮箱与校内机房位置

---

## 🚀 Docker 一键部署与运行

在仓库根目录直接执行：

```bash
# 构建并后台启动全部服务 (PostgreSQL + Go API + Web Nginx)
docker compose up --build -d

# 查看各容器运行状态
docker compose ps
```

启动完成后：
- **Web 前端**: 浏览器访问 `http://localhost:3000` (可通过 `.env` 中的 `PORT` 自定义)
- **Go 后端 API**: `http://localhost:8080/api/v1/health`
- **PostgreSQL**: 端口 `5432`

> **初始管理员体验账号**：
> - 用户名：`admin`
> - 密码：`admin123`
> *(登录后拥有发文章、编辑、删除与置顶等完整后台管理权限)*

---

## 💻 本地纯开发环境运行 (可选)

如果你需要在本地不借助 Web 容器进行实时热重载开发：

```bash
# 1. 仅启动 PostgreSQL 容器
docker compose up -d postgres

# 2. 启动 Go 后端 (自动连接本地 5432)
cd server
go run ./cmd/server

# 3. 启动 React 前端 (带 Vite HMR 热重载)
cd ../web
pnpm install
pnpm dev
# 访问 http://localhost:5173
```
