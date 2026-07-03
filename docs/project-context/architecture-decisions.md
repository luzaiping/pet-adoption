# 架构决策 —— 宠物领养系统

## 已确认的决策

### 1. 技术栈版本锁定

锁定在 Next.js 15.5.19（而非 16.x —— 最新的 15.x 版本仍在接收后移植的安全补丁）、Prisma 5.22.0（而非 6.x/7.x，尽管 7.x 才是生态系统目前的最新版本）、NextAuth(Auth.js) 5.0.0-beta.31、PostgreSQL 16 (Neon)、bcryptjs 3.0.3 以及 zod 4.4.3。原因：本项目特意采用了与原始设计文档预期时代相匹配的、较旧且稳定的工具链，而不是一味追求最新的主版本（Next 16、Prisma 7、Postgres 18 均已存在但已被拒绝 —— 见“已拒绝/已移除的方案”；Prisma 5.x 的推出甚至早于 Postgres 18，因此将它们配对会是一个未经验证的组合）。这样做是为了保持内部一致性，而不是因为对新版本不熟悉。

zod 4.4.3 的引入比原计划提前了（原计划作为后续步骤，但因注册功能的校验复杂度已达到使用标准，故提前引入至注册功能中）。关于 v4 API 的使用：请使用顶层的 `z.email()`，而不是已废弃的 `z.string().email()`。

### 2. 数据库托管：选择 Neon 而非 Supabase

Neon 在闲置约 5 分钟后会自动挂起计算资源，并在下一次请求进入时在毫秒级内自动恢复。而 Supabase 的免费层在不活动 7 天后会暂停，并且需要去控制面板手动点击“恢复（Restore）”（90 天后则需要进行手动的备份迁移）。对于一个长期存在且低流量的个人作品集演示项目（Portfolio Demo），Neon 做到了零维护成本。

### 3. 数据模型与基于角色的访问控制 (RBAC)

共有五个模型：User（用户）/ Shelter（收容所）/ Pet（宠物）/ PetImage（宠物图片）/ AdoptionApplication（领养申请）。RBAC 通过 `User` 模型上的单个 `role` 枚举（`USER`/`STAFF`/`ADMIN`）来实现 —— 无需单独的权限表，因为不需要细粒度的权限矩阵。`AdoptionApplication` 与 `User` 存在两个不同的关联关系：`applicant`（申请人，配置为 `onDelete: Cascade`）和 `reviewer`（审核人，可选，配置为 `onDelete: SetNull`） —— 由于它们都指向同一个表，因此通过 Prisma 关联名称（`@relation("ApplicantApplications", ...)` / `@relation("ReviewerApplications", ...)`）进行区分。级联删除的流动方向为：Shelter（收容所）→ Pet（宠物）→ PetImage（宠物图片）/ Applications（申请），这样每日的演示重置（Demo Reset）就不需要按照手动安排的顺序分步删除表。删除一个 `User` **不会**级联删除他们审核过的申请 —— 仅仅会将 `reviewerId` 设为 null —— 从而确保即使删除了员工账号，审核历史记录依然得以保留。`Pet.species`（宠物物种）使用的是普通 `String` 类型而非枚举 —— 这为以后无需执行数据库迁移即可直接添加新物种留出了空间。`ActivityLog`（活动日志）已被砍掉（作为“如果进度落后则砍掉”清单上的首要项目）。

### 4. 宠物图片：本地静态文件，而非真实的上传

20–30 张猫/狗的照片（4:3 比例，长边约 1200px，每张小于 300KB，源自 Pexels/Unsplash）直接提交到 `/public/pets/` 目录下，命名为 `dog-01.jpg`...`dog-15.jpg` / `cat-01.jpg`...`cat-15.jpg`。管理员的“上传”UI 实际上是一个基于该固定图片池的选择器，而不是真实的上传管道。`PetImage.url` 存储的是相对路径。

### 5. 演示模式 (Demo Mode)

`isDemoMode()` 辅助函数由 `IS_DEMO` 环境变量控制，并返回布尔值。采用 `useActionState` 的写操作在 Action 顶部调用该函数，并按各自的返回类型封装友好的业务错误；具体的返回风格与命名理由见决策 #18。每日 Vercel Cron 定时任务（定在美东/欧洲夜间，即流量最低时段）会调用 `resetAndSeedDatabase()` 来清空并重新灌入数据。需要在 README 中记录的权衡是：如果管理员在夜间自动重置前不久刚生成了一个 AI 宠物简介，该简介将被回滚 —— 这是预期内的行为，并非 Bug。

状态：`IS_DEMO` 环境变量和 `isDemoMode()` 已实现，并已接入 `registerAction` 与 `submitApplicationAction`。每日 Cron 重置仍在挂起（待开发）状态。由 TanStack Query `useMutation` 调用的写操作继续采用 Promise 抛错与 `onError` 处理方式，不在本阶段转换为表单式 return。

### 6. 种子脚本拆分：可复用函数 vs. CLI 入口点

`src/lib/seed-data.ts` 导出一个纯粹的 `resetAndSeedDatabase()` 函数，该函数**不**调用 `$disconnect()` —— 它不拥有 Prisma 连接的生命周期，因为未来的 Vercel Cron API 路由将从一个长期运行的 Next.js 进程内部导入并调用此函数，而在该进程中主动断开共享的单例（Singleton）连接会破坏整个应用。`prisma/seed.ts` 是一个薄薄的 CLI 包装器（由 `npx prisma db seed` 使用），它在调用该函数**之后**会执行断开连接，因为这是一个应当干净利落退出的单次执行进程。这种拆分方式的存在，正是为了让数据灌入逻辑有且仅有一个实现，并能同时被 CLI 和未来的 Cron 路由复用。

### 7. 认证：NextAuth v5，凭据 + JWT，无 Prisma 适配器（3层 RBAC 防御架构）

不使用 `@auth/prisma-adapter` —— 纯凭据（Credentials）+ JWT 的模式不需要它（该适配器仅对 OAuth 的 Account/Session/VerificationToken 表有意义）。如果以后要加入 Google OAuth，适配器和这些表届时将作为一个完整的组合任务一并引入，而不是现在零散地添加。

配置被拆分为 `auth.config.ts`（边缘安全：providers 数组为空，包含 `authorized`/`jwt`/`session` 回调，不导入 Prisma —— 可以在 Edge Middleware 中运行）以及 `auth.ts`（完整配置：包含凭据提供者，其中带有手写的 `prisma.user.findUnique` + `bcrypt.compare`，会话策略为 `jwt`） —— 这确保了仅限 Node 环境的依赖不会混入兼容边缘（Edge）的代码路径中。`authorize()` 回调的返回对象在流入 `jwt` 回调并加密到 Token 之前，特意排除了密码哈希（password hash）字段。

`middleware.ts` 直接导出 `NextAuth(authConfig).auth`，**没有**将其包装在自定义函数中 —— 这保留了官方文档中关于 `authorized()` 回调清晰无歧义的行为（见“已拒绝/已移除的方案”）。`authorized()` 承担了双重职责：(a) 作为 `/dashboard/*` 的登录权限门禁（返回 `false` → 重定向到 `pages.signIn`），(b) 作为 `/dashboard/admin/*` 的角色门禁（当角色不是 ADMIN 时返回 `NextResponse.redirect('/dashboard/forbidden')`）。匹配器仅设置为 `matcher: ['/dashboard/:path*']` —— 公共/认证页面**不**由中间件覆盖，且中间件保持执行纯 JWT 的检查，不进行任何数据库查询。

`/dashboard/forbidden` 页面特意放在了 `/dashboard/admin/*` 之外，以避免引发无限重定向循环（正如 NextAuth 官方文档对此发出的警告）。后续切勿将其移动到 `/admin/` 目录下。针对已登录用户访问 `/login` 或 `/register` 的情况，将通过页面级别的 `await auth()` + `redirect()` 检查在 Server Component（服务端组件）内部进行重定向处理 —— 而不通过中间件（因为匹配器未覆盖这些路径）。

纵深防御包含 3 个层面，现均已建立：第 1 层 = 中间件的 `authorized()` 回调；第 2 层 = `(dashboard)/dashboard/admin/layout.tsx` 中的角色检查；第 3 层 = 管理员 Server Action 内部调用的 `assertAdmin()` 辅助函数。`assertAdmin()` 采用抛错中断风格，并额外查询数据库复核当前用户及角色；完整理由见决策 #16。

### 8. 目录/文件规范

- **路由组（Route Groups）**：分为 `(public)` / `(auth)` / `(dashboard)`，用于物理层面的权限边界隔离 —— 由于路由组在 URL 中是不可见的，因此任何包含需要定位在嵌套路径（例如 `/dashboard`）下页面的路由组，其内部必须包含一个真实的嵌套文件夹片段。
- `actions/` 文件夹位于 `app/` 之外，按业务领域进行拆分。
- `schemas/` 是由 React Hook Form 和 Server Actions 共同使用的唯一 Zod 校验源；目前包含 `schemas/auth.ts`（注册校验）。
- shadcn 组件在 `components/ui/` 中保持原生状态不作修改；业务组件则放入 `components/features/[domain]/`。
- `providers/query-provider.tsx`（尚未创建）将仅包裹 `(dashboard)/layout.tsx`，从而使公共页面保持纯粹的 Server Components。

### 9. 表单策略

简单表单（登录、注册、提交申请）使用原生的 `useActionState` + Server Action —— 不使用 React Hook Form。复杂表单（宠物创建/编辑）将使用 React Hook Form + Zod + shadcn 的 `Form` 组件。公共宠物筛选利用 URL 的 `searchParams` + Server Component 实现（有利于 SEO 且链接可分享）。管理员端的变更（Mutations）将使用 TanStack Query 的 `useMutation` 包装 Server Action 来实现乐观更新（Optimistic Updates）。不引入 Zustand —— 基于目前重度依赖 Server Component 的架构，它并不是必需的。

在注册校验失败时，只有 `email` 字段的值会被回显（Echo）到表单中；`password`/`confirmPassword` 绝不回显（见“已拒绝/已移除的方案”）。

### 10. 公共宠物浏览

查询逻辑集中在 `src/lib/pets.ts`（`getPets()`, `getPetById()`）中，而不是直接内联写在 `page.tsx` 里 —— 这是为了预备未来管理员宠物页面对其进行复用。宠物只有两种状态（Available / Adopted），并通过共享的 `StatusBadge` 辅以颜色区分。`PENDING` 只属于领养申请状态，不属于宠物状态：允许多人同时申请时，宠物在审批通过前始终保持 `AVAILABLE`，审批通过后直接变为 `ADOPTED`。分页采用基于偏移量（Offset-based）的 `skip`/`take` 模式，每页 12 条 —— 选用此方案而非基于游标（Cursor-based）的分页，是因为区区 30 条记录并不值得去增加实现复杂度；它需要一个确定性的排序 `orderBy`（例如 `createdAt` + 用 `id` 作为决胜项），否则分页可能会出现重复或遗漏项。更改物种筛选时会将 `page` 重置为 1 —— 否则切换分类时可能会落入一个超出范围的空白页面。`pagination.tsx` 和 `status-badge.tsx` 被构建为通用的、可复用的组件，而非宠物特异性组件 —— 同样是为了预备未来管理员宠物页面的复用。详情页上没有设计“相似宠物”板块 —— 刻意保持简单。在 `/pets` 和 `/pets/[id]` 上均加入了 `loading.tsx`（基于 Suspense 的骨架屏） —— 这主要是为了应对已记录的 Neon 数据库冷启动延迟；它在分页/筛选条件改变时也会短暂触发，而不仅仅是首次加载。

### 11. 设计系统 Token

主色调：深松绿（`#3A6B53`，通过手写的 sRGB→OKLab→OKLCH 脚本精确计算为 OKLCH 颜色 —— 而非粗略估算）。背景采用温暖的米白色，温暖的粘土色（`#D97A3E`）则克制地使用（例如用于演示模式的徽章），不作为主要的主行动点（CTA）颜色。标题字体：Fraunces（衬线体）。正文/UI 字体：Plus Jakarta Sans。通过两个独立的 `next/font` CSS 变量（`--font-sans`, `--font-heading`）来实现，而不是将一个别名化（Alias）到另一个上（shadcn 的默认模板自带的是 `--font-heading: var(--font-sans)`，在此已被更改）。目前仅对浅色模式（`:root`）进行了自定义；`.dark` 以及侧边栏/图表（sidebar/chart）的 Token 特意保留了 shadcn 的默认值，因为暗黑模式和侧边栏组件目前并不在构建计划中。

### 12. Neon 连接字符串

包含两个 URL：`DATABASE_URL`（带有连接池，主机名中包含 `-pooler`，在运行时使用）和 `DIRECT_URL`（不带连接池，由 `prisma migrate`/`db seed` 使用） —— 无论 Prisma 的次版本是多少，这都是必需的，因为 Neon 的连接池使用的是 PgBouncer 事务模式（Transaction Mode），这会破坏架构变更（Schema-changing）迁移命令所需要的预处理语句（Prepared Statements）。`DIRECT_URL` 尾部附加了 `&connect_timeout=15`，以容忍 Neon 的冷启动延迟（TCP 能够瞬间连接，但处于闲置期后的 Postgres 握手所耗费的时间可能会超出 Prisma 默认的超时时限）。

### 13. Git 分支管理

`main` 分支始终保持可发布状态；当前的所有开发工作都在 `feature/upwork-demo` 分支上进行。未来的迭代（如新写技术栈、新功能）将从 `main` 检出它们各自的 `feature/*` 分支。

### 14. 领养申请提交 / 撤销流程

**并发申请策略**：多名用户可以同时针对同一只宠物提交申请。在此阶段，`Pet.status` 保持为 `AVAILABLE`（可领养），且在提交申请时**不会**更新。同一名用户对同一只宠物同时只能拥有**一个活跃的（`PENDING`）申请**。一旦申请变为 `REJECTED`（已拒绝）或 `WITHDRAWN`（已撤销），该用户便可以提交新的申请。关于审批处理、关闭其他并发申请以及切换 `Pet.status` 的逻辑，已刻意延期至**管理员审核队列（Admin Review Queue）**任务（后续步骤 #2）中实现。本次的提交/撤销流程**不**修改 `Pet.status`。

在 `status` 枚举中增加了一个新的 `WITHDRAWN` 枚举值，以便将用户主动发起的撤销与管理员做出的 `REJECTED` 决定区分开来，从而避免在 UI 文本上让用户误以为自己是被系统拒绝了。

为了防止重复提交，**不要**使用数据库的部分唯一索引（Partial Unique Index）。相反，应当在应用层的事务（Transaction）内部执行重复项检查。这符合项目现有的指导原则，即对于演示规模的流量，优先选择更简单的实现，而不是针对特定数据库进行优化（例如，此前决定对大约 30 条记录的表不使用游标分页）。极小的竞态条件窗口（Race Window）被认为是可接受的折衷，从而避免去维护原生 SQL 迁移。

引入 `sonner` 依赖项来提供 Toast 提示功能。在此之前，项目曾刻意避免仅仅为了 `/dashboard/forbidden` 页面而添加 Toast 库。这是首次实际引入 Toast 组件。将 `<Toaster/>` 挂载在根目录的 `app/layout.tsx` 中，而不是路由组布局内，以便其未来能在其他路由组中复用。

Server Actions 绝不能依赖中间件来进行会话验证（Session Validation）。默认情况下，任何暴露在 `(public)` 路由组下的 Server Action 写操作都在中间件的保护范围之外。此类 Action 必须显式调用 `auth()` 来验证用户的会话。

`AdoptionApplication.message` 是一个可选的留言留言字段。在用户点击 **Apply（申请）** 时，不要打开对话框（Dialog），而是直接在页面上展开一个内联表单（文本域 + 确认/取消）。Schema 依然保持可选，通过占位符文本引导用户根据意愿填写留言。

### 15. Admin Review Queue：approve 的事务性逻辑与状态流转
approve 一条申请时，三步操作包在同一 $transaction：目标申请置 APPROVED、同一宠物下其他 PENDING 申请批量置 REJECTED、Pet.status 从 AVAILABLE 改为 ADOPTED。`PetStatus` 不定义 PENDING；PENDING 仅用于 `ApplicationStatus`。reject 单条申请是独立操作，不影响宠物状态和其他申请。

### 16. assertAdmin() + Admin layout 双层防御正式建立
assertAdmin() 放在 src/lib/auth-guards.ts，随第一个 admin Server Action 一起创建（RBAC 第三层）。app/(dashboard)/dashboard/admin/layout.tsx 作为第二层，页面级 role 检查，非 ADMIN redirect 到 /dashboard/forbidden。两层各自独立，缺一不可。

`assertAdmin()` 除了验证签名 JWT 中的 ADMIN 角色，还必须按 session user id 查询当前数据库记录并再次确认角色。原因是 reset/seed 会重建 User 并生成新 id，浏览器中的旧 JWT 可能仍然有效；数据库复核可以在守卫层拒绝陈旧会话，也能立即反映管理员被删除或降权的情况，避免写入 `reviewerId` 时才触发外键错误。

### 17. TanStack Query 正式引入，scope 限定在 dashboard
providers/query-provider.tsx 只挂在 app/(dashboard)/layout.tsx，不挂根 layout——公开页面是纯 Server Component，不需要 QueryClient，避免把客户端状态管理污染到本不需要它的区域。Admin mutations（approve/reject）是项目第一批使用 useMutation 的操作。

### 18. 演示模式拦截 helper 命名为 isDemoMode()，采用布尔返回风格，与 assertAdmin() 的抛错风格并存
isDemoMode() 不抛出 Error，返回纯布尔值，表示当前是否处于演示模式，不附带任何业务错误结构。调用方（submitApplicationAction、registerAction）自行判断该布尔值并封装各自的 return 结构，例如 if (isDemoMode()) return { success: false, message: '...' }。
命名刻意不用 assert 前缀：项目里 assertAdmin() 已经确立了 assert 前缀的语义——断言某条件必须成立，不成立则抛错中断，调用后代码可安全假设条件已满足。而这个 helper 是纯查询、无副作用、返回值需要调用方自行处理两种分支，命名上应使用 is 前缀以准确反映"状态查询"而非"断言中断"的语义，避免与 assertAdmin() 的既有用法产生误导性的心智负担。
选择布尔返回而非方案A中"直接返回业务错误对象"的设计，是刻意让调用方拥有更大的封装自由度（每个 Action 可以按自己的 return 类型自行拼装错误结构），代价是面向用户的提示文案会分散在各个调用点各写一份，而不是在 helper 里集中维护一份。这个 tradeoff 是有意识接受的，后续如果多个调用点的文案出现不一致或需要统一调整，可以再评估是否要抽一个共享的 message 常量，但不需要现在改变 isDemoMode() 本身的返回结构。
isDemoMode() 与 assertAdmin() 两个 guard 函数按各自调用方的既有惯例（return 风格 vs throw 风格）独立设计，不强求二者行为或命名范式统一。

### 19. `/dashboard` 作为按角色分发的服务端入口，不再承担展示页职责
登录成功后仍统一进入 `/dashboard`，再由该 Server Component 通过 `auth()` 读取角色并执行分发：USER 跳转到 `/dashboard/applications`，ADMIN 跳转到 `/dashboard/admin`，当前尚无产品功能的 STAFF 跳转到 `/dashboard/forbidden`，未登录用户跳转到 `/login`。这样认证流程不需要知道各角色的具体落点，后续角色目标变化时只需维护一个分发入口。`redirect()` 保持在 `try/catch` 之外，避免吞掉 Next.js 的内部重定向异常。

### 20. USER 不显示业务菜单；ADMIN 使用独立的三项管理导航
USER 当前只有“我的申请”一个目标页面，额外菜单没有信息架构价值，因此 Dashboard Header 仅保留品牌、用户身份和退出入口。ADMIN 显示独立的 Overview、Applications Queue、Pet Management 三项导航，分别指向 `/dashboard/admin`、`/dashboard/admin/applications`、`/dashboard/admin/pets`。品牌区域不区分角色，统一链接到公开首页 `/`，作为 Dashboard 返回公共站点的固定出口；公开首页反向进入 Dashboard 的入口留给后续首页任务。

导航高亮由使用 `usePathname()` 的最小 Client Component 负责，session 与角色判断仍留在 Server Component，不引入 `next-auth/react`。Overview 只精确匹配 `/dashboard/admin`；Applications Queue 与 Pet Management 同时匹配各自根路径和后续子路由，并设置 `aria-current="page"`。移动端使用较短的 Queue/Pets 文案，避免三项导航造成横向溢出，桌面端保留完整名称。

需要注意：以上只是展示层的角色区分，不代表数据或校验层已禁止 ADMIN 提交领养申请。`submitApplicationAction` 当前仍未限制角色，该潜在业务规则缺口本次不处理，留待后续单独评估。

### 21. `/dashboard/admin` 定位为轻量管理工作台
Admin Overview 是可返回、可导航的真实页面，而不是自动跳转入口。首版只包含欢迎区以及由配置数组映射生成的 Review Applications、Manage Pets 两个 Quick Actions，不查询统计数据，也不复制审核队列或宠物列表的业务内容。该结构为未来增加其他管理模块或统计摘要保留扩展空间，同时避免在功能尚未完整时提前引入额外数据库查询。

---

## 已拒绝 / 已移除的方案

- **`@auth/prisma-adapter`**：曾安装，后又卸载。它仅在需要 OAuth（Account/Session/VerificationToken 表）时才被需要；凭据 + JWT 模式不需要适配器。如果未来加入 Google OAuth 功能，它将与那些表作为一个完整的组合任务一并重新引入 —— 现在不会零散地添加。
- **使用 Better Auth 代替 NextAuth v5**：在发现 Auth.js/NextAuth 在 2026 年初被 Better Auth 团队收购并进入仅维护模式（仅提供安全补丁）、且 Better Auth 官方文档推荐在新项目中使用它之后，曾考虑过该方案。但开发者明确选择继续留在 NextAuth v5，接受选择“遗留技术栈”的代价，以避免重新学习 API 设计的成本。
- **Next.js 16.x / Prisma 6.x–7.x / Postgres 18**：在撰写本文时，这些全都是实际上的最新版本，但已被拒绝，转而选用符合原始设计文档预期工具链时代的较旧版本。
- **登录页面使用 shadcn 的 `form` 组件 + React Hook Form**：略过 —— 根据表单策略决定（#9），登录属于“简单表单”，因此使用纯 `Input`/`Label`/`Button` + 原生 `useActionState`，而不使用基于 RHF 的 `Form` 组件。
- **`@types/bcryptjs`**：未安装 —— `bcryptjs` 3.x 自带了 TypeScript 类型定义；添加旧的 `@types` 包会造成冗余并可能引发冲突。
- **将 `(dashboard)/page.tsx` 放在路由组根目录**：最初直接创建在 `(dashboard)/` 下，这与 `(public)/page.tsx` 发生了冲突 —— 因为路由组在 URL 中是不可见的，它们都会解析到 `/`。已通过在路由组内部嵌套一个真实的 `dashboard/` 路径片段进行了修复。
- **Neon 自动生成的 Prisma 代码片段注释**（“仅在 Prisma < 5.10 时取消注释 `directUrl`”）：未予信任/采纳 —— 当前的 Neon 文档建议无论 Prisma 的次版本是多少都应当保留 `directUrl`，因为底层的 PgBouncer 事务模式问题并不依赖于版本。
- **自定义包装的中间件函数**（内部带有手写逻辑的 `auth((req) => {...})`）：被拒绝，转而采用直接扩展 `authorized()` 回调并返回 `NextResponse` 的方案。在 NextAuth v5 的仓库中，存在关于一旦以这种方式包装 `auth()` 后 `authorized()` 是否仍会触发的未决报告；而直接扩展 `authorized()` 则是官方记录在册且清晰无歧义的作法。
- **Node.js 中间件运行时**（`runtime: 'nodejs'`，在 Next.js 15.5.x 中已稳定）：曾考虑，未采纳。中间件保持执行纯 JWT 检查，不进行数据库查询，这符合反对在中间件中查询数据库的建议。
- **重定向至 `/dashboard` + 通过查询参数驱动 Toast** 来作为“拒绝访问”的体验（UX）：被拒绝，转而采用专门的 `/dashboard/forbidden` 页面。这避免了需要引入 Toast 库、避免了查询参数读取/清除的时序问题，并为未来的防御层提供了一个可复用的重定向目标。
- **针对 `/pets` 采用基于游标（Cursor-based）的分页**：被拒绝，转而采用偏移量（`skip`/`take`）分页；30 条记录并不值得去增加实现复杂度。
- **在校验失败时将 `password`/`confirmPassword` 回显到表单中**：被拒绝；仅回显 `email`。
- **通过中间件将已登录用户从 `/login` 和 `/register` 重定向开**：首次尝试曾这样做过，但由于 `matcher` 仅覆盖了 `/dashboard/:path*`，导致加入的逻辑实际上从未运行过（成了无声的死代码）。在合并前发现了该问题；已替换为在各个页面内部通过页面级的 `await auth()` + `redirect()` 进行检查。
