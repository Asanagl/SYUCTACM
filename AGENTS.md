# AGENTS.md - SYUCTACM 开发与协作规范

本文档为所有在 Codex 或外部环境中参与 **SYUCTACM**（沈阳化工大学 ACM-ICPC 集训队官方网站与服务平台）开发的人类与 AI Agent 设定强制性工作流、工程约束与架构原则。

---

## 零、 核心开发哲学

1. **破坏性重构优先（Zero Backward Compatibility Burden）**  
   本项目处于敏捷初期（Pre-1.0），**严禁为了历史向后兼容保留陈旧代码、冗余 shim、过渡层或废弃 API**。一旦发现更优设计，直接做干净利落的破坏性重构（Breaking Changes），代码库以当前最清晰、最健壮、最优雅的架构为唯一标准。
2. **零垃圾留存（Zero Garbage Left Behind）**  
   所有临时产物、实验脚本与 Worktree 必须严格收敛于 `.temp/` 目录。每次任务交付后，必须彻底清理本地临时分支与 worktree，保持主工作区绝对整洁。严禁向 Git 仓库提交任何非代码临时文件。
3. **务实克制，拒绝过度设计（Pragmatic & Anti-Overengineering）**  
   严格根据实际业务演进推进技术栈，不提前引入非必需的基础设施（如现阶段坚决不引入 Redis，不引入复杂的微服务或消息队列）。保持小而强悍。

---

## 一、 标准任务开发工作流 (Standard Workflow)

无论是进行功能开发、Bug 修复还是架构重构，**必须**严格遵循以下全流程：

```text
[创建/确认 Issue] ➔ [在 .temp/ 中创建 Worktree] ➔ [在 Worktree 中开发测试] ➔ [提交并推流] ➔ [创建 PR 并合并] ➔ [主分支拉取] ➔ [彻底清理 Worktree]
```

### 步骤 1：在 GitHub 创建或确认对应 Issue
在开始写任何业务代码前，先创建明确的任务 Issue：
```bash
gh issue create --title "<类型>: <清晰描述>" --body "<背景、目标与实现计划>"
# 记录返回的 Issue 编号，例如 #1
```

### 步骤 2：在 `.temp/` 目录下创建独立 Git Worktree
严禁直接在主仓库根目录切换分支开发。统一在 `.temp/` 下开辟隔离的 worktree：
```bash
# 确保在仓库主分支根目录
git checkout main
git pull origin main

# 分支命名规范：<type>/issue-<编号>-<简短名>
BRANCH_NAME="feat/issue-<编号>-<简短名>"

# 在 .temp/ 下创建对应 worktree
mkdir -p .temp
git worktree add ".temp/${BRANCH_NAME}" -b "${BRANCH_NAME}"
cd ".temp/${BRANCH_NAME}"
```

### 步骤 3：在 Worktree 中完成开发与本地双端验证
在 `.temp/${BRANCH_NAME}` 目录下执行编码，必须通过双端构建校验：
```bash
# 1. 验证后端 Go 编译无报错
cd server && go build ./... && cd ..

# 2. 验证前端 TypeScript 与 Vite 构建无警告/报错
cd web && pnpm build && cd ..

# 3. 提交代码（严格遵循 Conventional Commits）
git add .
git commit -m "<type>(scope): <subject>"

# 4. 推送分支至 GitHub
git push -u origin "${BRANCH_NAME}"
```

### 步骤 4：在 GitHub 创建 Pull Request
```bash
gh pr create --title "<type>(scope): <subject>" --body "Closes #<编号>\n\n<实现细节与验证结果>"
```

### 步骤 5：PR 合并与主仓库更新
PR 经过审查或合并后，切回主仓库目录同步最新代码：
```bash
cd /home/lingbou/WorkSpace/SYUCTACM/SYUCTACM
git checkout main
git pull origin main
```

### 步骤 6：清理 Worktree 与本地临时分支（清理垃圾）
合并完成后，必须彻底删除 worktree 和本地临时分支，释放磁盘空间并防止垃圾残留：
```bash
# 强制移除 worktree
git worktree remove --force ".temp/${BRANCH_NAME}"

# 删除本地临时分支
git branch -D "${BRANCH_NAME}" 2>/dev/null || true

# 检查 worktree 状态确保清理干净
git worktree list
```

---

## 二、 分支与提交规范 (Branch & Commit Conventions)

### 1. 分支命名规则
* **严禁使用 `codex/` 等特定工具私有前缀**。
* 必须使用通用的业界语义化前缀，格式为：`<type>/issue-<编号>-<简短描述>`：
  * `feat/issue-1-user-auth`（新功能）
  * `fix/issue-2-cors-origin`（Bug 修复）
  * `refactor/issue-3-api-handlers`（无外部行为变更的代码重构）
  * `chore/issue-4-update-deps`（配置、依赖、构建脚本调整）
  * `docs/issue-5-update-readme`（文档与规范编写）

### 2. Commit Message 规范
严格遵循 **Conventional Commits** 规范，格式：`<type>(<scope>): <subject>`：
* `feat`: 新增业务功能
* `fix`: 修复缺陷
* `refactor`: 重构代码（不改变外部行为）
* `docs`: 文档变动
* `chore`: 构建配置、依赖管理
* `perf`: 性能优化
* `test`: 增加或修改测试
* 示例：
  * `feat(auth): implement jwt token generation and validation middleware`
  * `fix(web): resolve logo responsive overflow on mobile screens`
  * `refactor(db): migrate user model to support student number indexing`

---

## 三、 目录与环境隔离规范

### 1. `.temp/` 目录规范
* 路径：`$PROJECT_ROOT/.temp/`
* 用途：
  * Git Worktree 独立开发目录（如 `.temp/feat/issue-1-...`）；
  * 调试日志、中间测试产物、实验性脚本、临时数据。
* 规则：
  * `.temp/` 已被全局加入 `.gitignore`，**严禁将其提交至 Git**；
  * 定期保持 `.temp/` 内部无长期孤立 worktree。

---

## 四、 架构底线与工程约束 (Code Guardrails)

### 1. 技术栈强制约定
* **前端 (`web/`)**：
  * 框架与语言：`React 19` + `TypeScript 5.8+` + `Vite 8+`；
  * 样式体系：`Tailwind CSS v4` + `Lucide React` 图标；
  * 规范底线：启用严格模式，严禁滥用 `any`，提交前必须执行 `pnpm build`（内置 `tsc -b`）通过。
* **后端 (`server/`)**：
  * 语言与框架：`Go 1.24+` + `Gin`；
  * 数据持久化：`GORM` + `pgx` 驱动；
  * 规范分层：
    * `cmd/server/main.go`：程序入口与装配；
    * `internal/config/`：配置与环境变量解析；
    * `internal/database/`：PostgreSQL 连接与自动迁移（具备连接失败优雅降级逻辑）；
    * `internal/model/`：GORM 数据实体模型；
    * `internal/api/`：路由 (`router.go`)、中间件 (`middleware/`) 与控制器 (`handler/`)。
  * 规范底线：提交前必须执行 `go build ./...` 通过。
* **数据层与中间件**：
  * 数据库统一采用 **PostgreSQL 16+**；
  * 本地开发通过根目录 `docker-compose.yml` 编排；
  * **严禁私自引入 Redis、Kafka 等其他服务**。如有状态需求，一律通过 JWT 或 Go 内存结构实现。

### 2. 接口设计与网络底线
* API 路由统一前缀：`/api/v1`；
* 接口响应体格式统一：
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {}
  }
  ```
  *(错误状态返回对应的 HTTP Status Code 与 `{"error": "reason"}`)*；
* 端口约定：后端端口默认为 `:8080`，前端本地端口 `:5173`（开发环境自动反代 `/api` 到 `:8080`）。

### 3. 与现有资产集成约定
* **校内 Hydro OJ 联动**：
  * 生产环境 OJ 地址为 `https://oj.syuctacm.cn`；
  * 后续与 HydroOJ 数据库（MongoDB）或 API 对接时，需在 `server/internal/` 开辟独立的只读客户端包，严禁侵入式修改 OJ 原生数据结构。
* **品牌资产安全**：
  * 官方 Logo 存放在 `web/public/logo.png`，保留透明通道与矢量清晰度，严禁使用失真或未经压缩的位图。
