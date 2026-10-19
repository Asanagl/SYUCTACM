# SYUCT ACM 官方平台 (SYUCTACM)

沈阳化工大学 ACM-ICPC 集训队官方网站与数字化服务平台。

- **组织主页**: [https://github.com/syuctacm](https://github.com/syuctacm)
- **核心评测**: [https://oj.syuctacm.cn](https://oj.syuctacm.cn)

---

## 🛠️ 技术架构

本项目采用标准的前后端分离架构，兼顾轻量性能与长期可维护性：

- **前端 (`web/`)**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **后端 (`server/`)**: Go 1.24+ (Gin 框架 + GORM ORM + pgx 驱动 + JWT 鉴权)
- **数据库**: PostgreSQL 16+
- **基础设施**: Docker Compose 本地编排，线上经 Caddy 反代与 WireGuard 专线互通

---

## 📂 项目结构

```text
SYUCTACM/
├── web/                       # 前端 React 工程
│   ├── src/
│   │   ├── App.tsx            # 主应用与门户大屏
│   │   └── main.tsx
│   ├── public/logo.png        # 官方 Logo 资产
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # 后端 Go 工程
│   ├── cmd/server/main.go     # 服务启动入口
│   ├── internal/
│   │   ├── api/               # 路由与中间件
│   │   ├── config/            # 环境与配置读取
│   │   ├── database/          # PostgreSQL GORM 初始化
│   │   └── model/             # 数据库模型定义 (User, Announcement 等)
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml         # 本地 PostgreSQL 数据库容器编排
├── .env.example               # 环境变量参考
└── README.md
```

---

## 🚀 本地开发指南

### 1. 启动本地 PostgreSQL 数据库

```bash
# 启动本地 PostgreSQL 容器 (端口 5432)
docker compose up -d postgres
```

### 2. 启动 Go 后端服务

```bash
cd server
go run ./cmd/server
# 默认监听 :8080，API 前缀为 /api/v1
```

### 3. 启动 React 前端服务

```bash
cd web
pnpm install
pnpm dev
# 默认监听 http://localhost:5173，自动反代 /api 到后端 :8080
```
