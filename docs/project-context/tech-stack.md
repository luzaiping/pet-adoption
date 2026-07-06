# 技术栈与规范 —— 宠物领养系统

## 锁定的版本

* Next.js 15.5.19
* Prisma 5.22.0 / @prisma/client 5.22.0
* NextAuth (Auth.js) 5.0.0-beta.31
* PostgreSQL 16 (Neon)
* bcryptjs 3.0.3
* zod 4.4.3

所有版本均精确锁定 —— 不使用 `^` 范围。在添加任何新依赖或升级现有依赖之前，请先通过网络搜索以确认当前实际的最新版本。切勿盲目假设训练数据中的版本仍是最新版本；该生态系统的发展非常迅速。

## 代码规范

* 所有代码、注释和面向仓库读者的文档均使用英文；`docs/project-context/` 中的内部项目上下文使用中文。
* shadcn 组件 → 存放在 `components/ui/`；业务组件 → 存放在 `components/features/[domain]/`。
* Server Actions 存放在 `actions/` 目录中（位于 `app/` 之外），并按业务领域进行拆分。
* 简单表单（登录、注册、申请提交） → 使用 `useActionState` + Server Action，不引入 React Hook Form。复杂表单（宠物创建/编辑） → 使用 React Hook Form + Zod + shadcn `Form` 组件。
* Next.js 15 规范：`params` 是一个 Promise —— 必须对其进行 `await` 异步等待。
* 分页查询需要具备确定性的排序 `orderBy`（例如：`createdAt` + 用 `id` 作为决胜项）；每当筛选条件发生变化时，务必将 `page` 重置为 1。

## 流程规则

* 每次对话仅执行一项任务。在继续下一步之前，请等待用户的验证与确认 —— 切勿在未获确认的情况下擅自串联多个实现步骤。
* 在逻辑检查点（Logical Checkpoints）提出 Git 提交信息建议（采用 Google 规范，英文书写，要求包含 subject 和 description）。请仅以文本形式提供该信息 —— 在未获得明确确认前，绝不擅自运行任何 git 命令。
* 每当引入新的 `.env` 环境变量时，请提醒用户同步更新 `.env.example` 文件（仅保留占位符，绝不包含真实密钥），需提供环境变量的注释。
