# SYUCT ACM 官方平台（SYUCTACM）

沈阳化工大学 ACM-ICPC 集训队官方网站与数字化服务平台。

- **组织主页**：<https://github.com/syuctacm>
- **核心评测（Hydro OJ）**：<https://oj.syuctacm.cn>

站点采用中国科大 LUG 官网式的极简学术风：浅色底、文字为主、高信息密度，以 **News（官方文章）** 与 **Wiki（成员协作知识库）** 为两大内容支柱。

---

## 功能特性

- **首页**：组织简介 + 真实天气（沈阳铁西区，Open-Meteo 数据，30 分钟缓存）+ 文章图库轮播（自动提取文章正文首图，点击导向对应文章；无图时显示艺术字占位）+ 最新文章流（分类筛选：新闻 / 通知 / 薪火相传 / 选拔赛）
- **文章**：Markdown 渲染 + 代码块；详情为独立页面；置顶支持
- **Wiki 知识库**：算法模板、学习路线、培训资料等；**开放协作**（任何登录成员可创建/编辑任何页面，管理员可删除）；**修订历史**留痕、可查看可回退；LUG 式分组侧边树 + 页面目录盒 + 标题 Permalink + 上一页/下一页
- **问卷系统**：管理员自由组卷（单选/多选/单行/多行文本、必填、可选截止时间）；按问卷可选公开匿名或仅登录填写；登录用户每人限一次、截止前可改；管理端提供回答列表/单人明细/选择题统计图/CSV 导出/删除回答
- **管理后台**（仅管理员，经顶栏用户下拉进入）：文章管理（全量表格、标题搜索、分类筛选、置顶、独立 Markdown 编辑器带实时预览）+ 问卷管理
- **多用户系统**：JWT 注册登录，角色 admin / member / guest

## 技术栈

- **前端（`web/`）**：React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + react-router-dom + Marked（DOMPurify 消毒）+ Lucide 图标
- **后端（`server/`）**：Go（Gin + GORM + pgx + JWT），分层：`cmd/server` 入口、`internal/{config,database,model,api/{router,middleware,handler}}`
- **数据库**：PostgreSQL 16+（启动时 AutoMigrate 建表并 seed 初始数据）
- **部署**：Docker Compose（PostgreSQL + Go API + Nginx 静态站点，含 SPA 回退与 `/api` 反代）

---

## 快速开始

### 方式一：Docker Compose（部署/完整体验）

```bash
docker compose up --build -d
```

- Web 前端：`http://localhost:3000`（`.env` 中 `PORT` 可改）
- 后端 API：`http://localhost:8080/api/v1/health`
- PostgreSQL：`localhost:5432`

### 方式二：本地开发（热重载）

```bash
# 1. 启动 PostgreSQL（二选一）
docker compose up -d postgres        # 用容器
# 或使用系统 PostgreSQL：建库 syuctacm、用户 syuctacm（见 .env.example）

# 2. 后端（:8080，自动连 127.0.0.1:5432，可用 server/.env 覆盖）
cd server && go run ./cmd/server

# 3. 前端（:5173，/api 自动代理到 8080）
cd web && pnpm install && pnpm dev
```

### 初始管理员账号

- 用户名：`admin`　密码：`admin123`
- 登录后通过顶栏用户下拉进入「文章管理 / 问卷管理」

### 质量门禁（提交前必须通过）

```bash
cd server && go build ./... && go vet ./...     # 后端
cd web && pnpm build && pnpm lint               # 前端（lint 要求 0/0）
```

---

## API 概览

统一前缀 `/api/v1`。主要资源：

| 资源 | 说明 |
|---|---|
| `/articles` | 文章列表（分类筛选 + 标题搜索 + 分页）/详情；写操作仅 admin |
| `/wiki` | Wiki 页面 CRUD + `/wiki/tree` 目录树 + 修订历史与回退；写操作 member+，删除仅 admin |
| `/surveys` | 问卷填写（公开卷可匿名）与 `/admin/surveys` 管理端（统计/导出/删除，仅 admin） |
| `/weather` | 学校当前天气（服务端缓存） |
| `/auth` | 注册 / 登录 / 当前用户 |

## 内容来源：薪火相传

「薪火相传」栏目的学长学姐经验总结，来源于历届成员在 **[syuctacm/syuctacm_bak](https://github.com/syuctacm/syuctacm_bak/tree/master/seniors_summary)** 仓库 `seniors_summary` 目录留下的文字归档——记录他们在 ACM 集训队、考研、实习与毕业路上的思考与踩坑，供后来者参考。

## 协作规范

本仓库实行强制的 Issue → Worktree → PR 工作流与 Conventional Commits 提交规范，详见 [AGENTS.md](./AGENTS.md)。所有 PR 在创建前须先经过一轮 code review。

## License

见 [LICENSE](./LICENSE)。
