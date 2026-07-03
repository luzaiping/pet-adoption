# 进度快照 —— 宠物领养系统

（反映当前系统状态，而非按时间顺序记录的日志）

## 已完成

### 基础设施

- 已搭建 Next.js 15.5.19 脚手架，当前 Git 分支为 `feature/upwork-demo`。
- 引入 Prisma 5.22.0 并编写 `schema.prisma`（包含 5 个模型，4 个枚举 —— `PetStatus` 仅包含 `AVAILABLE` / `ADOPTED`，`ApplicationStatus` 包含 `PENDING` / `APPROVED` / `REJECTED` / `WITHDRAWN`），采用 Neon Postgres 16，已应用初始迁移；针对 `ApplicationStatus.WITHDRAWN` 已应用附加迁移。
- 编写了单例模式的 `src/lib/prisma.ts`（支持热重载 HMR 安全），连接性已通过验证。
- 编写了 `seed-data.ts` / `prisma/seed.ts` —— 灌入 5 个用户（2 个演示账号 + 3 个填充的申请人）、3 个收容所、30 只宠物（15 只狗 / 15 只猫，精确分布为 70% 可领养、30% 已领养）以及 19 份领养申请。待审核状态只存在于申请上；部分可领养宠物会同时拥有两份 `PENDING` 申请，以覆盖管理员并发审核场景。
- 搭建了路由组 `(public)` / `(auth)` / `(dashboard)` 目录结构（在早期发现并修复了路由组与 URL 的命名冲突 Bug）。
- 初始化了 shadcn/ui，定制了 OKLCH 设计系统的 Token，配置了 Fraunces（标题字体） + Plus Jakarta Sans（正文字体）；添加了 `components/ui/textarea.tsx` 组件。
- 引入 `sonner@2.0.7` —— 全局 `<Toaster/>` 已挂载在根目录的 `app/layout.tsx` 中。
- `tsconfig.json` —— 启用了 `noUnusedLocals` / `noUnusedParameters`；ESLint —— 将 `@typescript-eslint/no-unused-vars` 设置为错误级别。

### 身份验证与授权

- 接入 NextAuth v5：拆分为 `auth.config.ts`（边缘安全） + `auth.ts`（包含全量配置、凭据提供者、bcrypt），未使用 PrismaAdapter。
- `/login` 页面 —— 包含 `LoginForm` + `loginAction`，采用 `signIn()` + `AuthError` 模式 —— 已验证（成功与失败路径均通过）。
- `middleware.ts` —— 保护 `/dashboard/:path*` 路径，已验证（未认证用户 → 重定向至 `/login`）。
- 基于角色的管理员权限门禁 —— 扩展了 `authorized()` 回调，将非管理员用户从 `/dashboard/admin/*` 重定向至 `/dashboard/forbidden` —— 已使用两个演示账号进行了验证。
- 编写了 `/dashboard/forbidden` 页面（基于 shadcn 的 Alert 与 Button 组件）。
- `/register` 页面 —— 通过 Zod 进行校验（使用 `schemas/auth.ts` 中的 `registerSchema`），编写了 `registerAction`（包含唯一性检查、bcrypt 密码哈希、自动登录、确认密码字段，且在发生错误时绝不回显密码），该页面由 `IS_DEMO` 变量控制 —— 包含演示模式拦截在内的功能均已通过验证。
- 已登录用户访问 `/login` / `/register` 时，将通过页面级别的 `auth()` 检查被重定向至 `/dashboard`。

### 公共宠物浏览

- `src/lib/pets.ts` —— 编写了 `getPets()`（支持按物种筛选、偏移量分页、确定性 `orderBy` 排序）以及 `getPetById()`（包含关联的图片和收容所信息）。
- `/pets` 列表页（由 ChatGPT 实现） —— 通过 `StatusBadge` 展示所有状态的宠物，切换物种筛选时会将页码重置为 1，每页展示 12 条记录 —— 功能已验证，但被开发者标记为实现质量弱于其他页面，后续值得进行一次代码审查走查。
- `/pets/[id]` 详情页（在接管 ChatGPT 的工作后由 Claude 实现） —— 采用 `await params` 模式，针对不存在的宠物调用 `notFound()` 并提供自定义的 `not-found.tsx` 页面，实现了图片画廊、物种/品种/年龄/性别/描述展示、收容所信息以及领养申请提交面板的对接 —— 除了次级缩略图代码路径尚未测试外（当前种子数据每只宠物仅分配了一张主图），其余均已通过验证。
- 在 `/pets` 和 `/pets/[id]` 页面均加入了 `loading.tsx`（基于 Suspense 的骨架屏，用于应对 Neon 数据库冷启动延迟） —— 已验证其在分页/筛选条件改变时也会短暂触发。
- 共享组件包括：`pet-card.tsx`、`pet-filters.tsx`、`pagination.tsx`、`status-badge.tsx` —— 后面两个组件采用了通用化设计，预备供未来的管理员宠物页面复用。

### 领养申请提交与用户申请历史

- 将 `ApplicationStatus.WITHDRAWN` 引入至 Prisma 枚举并执行了迁移；撤回 Action 与用户侧入口均已接入。
- `schemas/applications.ts` —— 包含可选的留言字段，通过 Zod 限制最大 300 字符。
- `src/lib/applications.ts` —— 编写了 `getPendingPetApplicationByUserId()` 函数。
- `actions/applications.ts` —— 编写了 `submitApplicationAction`（使用 `useActionState`）：未认证用户 → 重定向至 `/login?callbackUrl=/pets/{id}`；校验宠物是否存在且状态为 `AVAILABLE`；在事务（Transaction）内部阻止同一用户对同一宠物重复提交 `PENDING` 申请（未采用部分唯一索引）；该操作**不**改变 `Pet.status`；成功后执行 `revalidatePath` 并保持在原页面（弹出 Toast 提示，不执行重定向）。
- 支持多名用户同时针对同一只宠物提交申请；每名用户对同一只宠物同时只能拥有一个活跃的 `PENDING` 申请（作用域相关疑问已解决 —— 见 `architecture-decisions.md` 第 14 条）。
- `/pets/[id]` 页面上的 `ApplicationPanel` —— 采用了可展开的内联表单（而非对话框弹窗），包含申请处理中状态卡片，并对接了 sonner 的成功/错误 Toast 提示。
- `/dashboard/applications` 已完成：Server Component 显式校验 session，数据层按当前 `userId` 查询全部申请历史及宠物主图，Client Component 使用 TanStack Query mutation 调用撤回 Action；业务失败进入 `onError`，成功后通过 `router.refresh()` 使用服务端真实数据更新状态。页面包含申请摘要、响应式宠物卡片、详情链接、日期与留言、单条撤回 loading 及空状态，已通过 lint、类型检查和 production build。
- 共享 `StatusBadge` 已扩展为类型安全的 `PetStatus | ApplicationStatus` 联合状态组件，并为 Available/Approved、Pending、Rejected、Adopted/Withdrawn 提供对应的成功、警告、危险和中性视觉语义。

### 管理员审核队列

- 已创建 `assertAdmin()`，管理员 approve/reject Server Actions 均在执行数据操作前调用该守卫；守卫会同时复核数据库中的用户存在性和当前 ADMIN 角色，陈旧 JWT 不会进入 reviewer 写入路径。
- 已创建管理员申请队列数据查询：仅返回仍有 `PENDING` 申请的 `AVAILABLE` 宠物，包含一张主图、待处理申请及申请人的安全字段（`id` / `name` / `email`），并采用 `createdAt` + `id` 确定性排序。
- 已创建 approve/reject Server Actions。approve 的三项状态更新位于同一事务中；批量拒绝仅影响同一宠物下除目标申请外的其他 `PENDING` 申请，不覆盖历史审核记录。
- 已在 dashboard layout 范围挂载 TanStack Query Provider；公开页面不加载该客户端状态依赖。
- `/dashboard/admin/applications` 已实现完整审核 UI：Server Component 获取初始队列，Client Component 使用 `useMutation` 调用 approve/reject Actions，并提供乐观更新、失败回滚、处理中禁用、Toast、响应式宠物分组卡片、摘要统计和空状态。已通过浏览器渲染验证。

### 演示模式防御

- 已创建返回布尔值的 `isDemoMode()` helper，统一读取 `IS_DEMO` 环境变量。
- `registerAction` 与 `submitApplicationAction` 均已在顶部接入演示模式拦截；两者的数据库操作错误会转换为通用 return 文案，不暴露 Prisma 原始错误。
- `registerAction` 的 `signIn()` 仍保留独立的 `AuthError` 处理；`withdrawApplicationAction`、`approveApplicationAction` 与 `rejectApplicationAction` 继续采用适配 `useMutation` 的 Promise 抛错方式。

### Dashboard 导航

- `/dashboard` 已改为服务端角色分发入口：USER 跳转至“我的申请”，ADMIN 跳转至 Admin Overview，STAFF 跳转至 Forbidden，未登录用户跳转至登录页。
- 已创建 Server Component `DashboardMenu`，在组件内部校验 session；USER 仅显示 Header，ADMIN 显示 Overview、Applications Queue、Pet Management 三项独立导航。品牌统一链接公开首页 `/`。
- 路径高亮隔离在使用 `usePathname()` 的 Client Component `DashboardNav` 中：Overview 精确匹配，审核队列与宠物管理支持子路径匹配，并通过 `aria-current` 标记当前页面。
- Dashboard Header 展示当前用户、角色标识与退出入口；移动端会缩短菜单文案并将退出按钮收缩为保留无障碍名称的图标入口，390px 视口下无横向溢出。
- 已创建极简 `signOutAction` 包裹 Auth.js `signOut()`，登出后跳转至公开的 `/login` 页面。

### Admin Overview

- `/dashboard/admin` 已实现为轻量管理工作台，包含欢迎区以及 Review Applications、Manage Pets 两个 Quick Actions。
- Quick Actions 由配置数组映射生成，能够扩展更多管理入口；页面保持纯 Server Component，不查询统计数据或复制子页面业务内容。
- 页面已通过桌面端和 390px 移动端浏览器验证；卡片在移动端单列排列且内容无横向溢出。

### 公共 Header

- 已为 `(public)` 路由组新增公共 Header：包含品牌、宠物浏览入口，并根据会话状态展示登录/注册或当前用户、角色、Dashboard 与退出入口。
- Header 根据 `IS_DEMO` 控制体验入口展示：演示模式下隐藏不可用的注册入口并显示 `Try as Adopter` / `Try as Admin`；当前身份会标记为 `Current`。
- `SwitchUser` 已接入 `switchUserAction`：两个入口分别提交受限的目标角色，由服务端映射到固定种子账号并通过 Auth.js Credentials 登录；支持未登录时快速体验及已登录时直接覆盖当前 JWT 切换身份。请求期间只在目标按钮显示 loading，并禁用两个入口以防重复提交；错误通过 Toast 展示，成功后刷新当前页面会话 UI。
- 已完成桌面端与 390px 移动端浏览器验证；移动端将体验入口放入独立双列区域，并确保页面没有横向溢出。

### 首页 Hero

- 已将首页占位内容替换为独立的 `HeroSection` Server Component，包含价值主张、单一宠物浏览 CTA、静态猫狗主视觉及辅助文案；不读取数据库、Session 或客户端状态。
- Hero 复用本地宠物图片与既有设计 Token，通过 `next/image` 的响应式尺寸和首屏优先加载控制图片表现；未引入新依赖。
- 已完成 1280px 桌面端和 390px 移动端浏览器验证；移动端 CTA 保持在首屏可见范围内，页面无横向溢出。

### 首页数据展示

- 已创建 `src/lib/home.ts` 首页读取模型：`getHomeStats()` 并行统计可领养宠物、已成功领养宠物和合作收容所；`getFeaturedPets()` 返回最新 4 只可领养宠物及其一张主图，宠物与图片查询均使用确定性排序。
- 首页新增实时统计条和 Featured Pets 两个 async Server Component，并分别使用组件级 Suspense 与匹配布局的骨架屏；Hero 不会被数据库查询阻塞。
- Featured Pets 复用现有 `PetCard`，支持不足 4 条及空状态，并提供全量宠物入口；当前文案明确定位为 Featured，而非个性化推荐。
- 已通过 lint、类型检查和 production build；首页构建结果为动态服务端路由。浏览器验证覆盖 1280px 与 390px：桌面四列、移动端单列，统计在两种视口均保持三列，页面无横向溢出或运行时错误。

## 已知问题 / 观察清单

- `/pets` 列表页的代码质量被开发者标记为平庸 —— 功能虽未损坏，但它是后续进行更细致的代码审查走查的候选对象。
- 详情页的多图缩略图展示行从未在真实数据下运行过 —— 因为当前的种子数据只为每只宠物分配了一张（主）图片；后续可以考虑为至少一只宠物种子数据分配多张图片。
- `/login` 仍在使用手写的验证逻辑，而非 Zod —— 导致 `/register` 与 `/login` 的实现风格不一致；此项属于低优先级清理任务。

## 后续步骤（已讨论，尚未开始）

1. **最终首页设计走查**（包含 Hero 模块、实时数据统计、推荐宠物、演示模式入口区域）。
2. **构建复杂表单**（宠物创建/编辑） —— 将通过 React Hook Form + Zod + shadcn `Form` 组件实现。
3. **进行移动端响应式适配走查**。
4. **利用 DeepSeek API 实现 AI 宠物简介生成**（需考虑速率限制）。
5. **构建 Vercel Cron 路由** —— 用于调用 `resetAndSeedDatabase()`。
6. **搭建 Vitest + Testing Library 测试环境**。
7. **完成 Vercel 生产部署**。
8. **完善 README 架构设计决策章节**、录制演示视频并准备屏幕截图。
