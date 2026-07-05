# 使用 Zod、React Hook Form、Server Action 与 shadcn/ui 构建复杂表单

本文以项目中的宠物创建/编辑表单为例，说明四个工具各自负责什么，以及数据从页面到数据库时经过哪些校验和转换。

相关代码：

- `src/schemas/pets.ts`：共享校验规则和数据转换。
- `src/components/features/admin/pet-form.tsx`：客户端表单状态、控件和错误展示。
- `src/actions/admin/pets.ts`：服务端重新校验、权限检查和数据库写入。
- `src/app/(dashboard)/dashboard/admin/pets/new/page.tsx`：创建页初始数据。
- `src/app/(dashboard)/dashboard/admin/pets/[id]/edit/page.tsx`：编辑页初始数据。

## 1. 四个工具分别解决什么问题

| 工具 | 主要职责 |
| --- | --- |
| Zod | 定义数据是否合法，并执行 trim、类型转换、归一化等处理。 |
| React Hook Form（RHF） | 管理客户端表单值、字段状态、提交状态和错误状态。 |
| Server Action | 在服务端执行权限检查、重新校验和数据库写入。 |
| shadcn/ui | 提供 Input、Select、Combobox、Field、FieldError 等界面组件。 |

它们不是四套互相独立的逻辑。推荐的数据流是：

```text
shadcn control
  → RHF stores raw input
  → Zod resolver validates on the client
  → Server Action receives untrusted values
  → the same Zod schema validates again
  → parsed and transformed data is written to Prisma
```

客户端校验改善交互体验，服务端校验保证安全性。不能因为客户端已经校验就省略服务端校验：用户可以绕过页面直接调用请求，客户端代码也可能被篡改。

## 2. 前后端如何共用同一套校验规则

### 2.1 Schema 放在双方都能导入的位置

项目将 schema 放在 `src/schemas/pets.ts`，而不是定义在 Client Component 或 Server Action 内部：

```ts
export const createPetSchema = z.object({
  name: z.string().trim().min(2).max(50),
  species: z
    .string()
    .trim()
    .min(1, 'Species is required.')
    .transform(
      (value) =>
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    ),
  // Other fields are omitted here.
});

export const updatePetSchema = createPetSchema.extend({
  id: z.string(),
  status: z.enum(PetStatus),
});
```

`updatePetSchema` 复用 create 字段，再增加 edit 独有的 `id/status`。它没有使用 `.partial()`，因此更新时仍必须提交完整字段。

归一化也属于 schema 的职责。`species` 的 transform 同时在客户端和服务端生效，避免只在 UI 中处理后被直接请求绕过。

### 2.2 客户端通过 resolver 使用 schema

`zodResolver` 是 RHF 与 Zod 之间的适配器：

```ts
const formSchema = isEditMode ? updatePetSchema : createPetSchema;

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues,
});
```

`form.handleSubmit(onSubmit)` 会先调用 resolver。只有客户端校验成功时，`onSubmit` 才会收到数据。

### 2.3 Server Action 必须再次 safeParse

Action 参数的 TypeScript 类型只在编译期存在，不能证明运行时请求可信：

```ts
const parsedResult = createPetSchema.safeParse(formValues);

if (!parsedResult.success) {
  const { fieldErrors } = z.flattenError(parsedResult.error);
  return { success: false, fieldErrors };
}
```

数据库必须使用 `parsedResult.data`，不能继续使用原始的 `formValues`：

```ts
await prisma.pet.create({
  data: {
    ...parsedResult.data,
    status: PetStatus.AVAILABLE,
  },
});
```

原因有两个：

1. `parsedResult.data` 才是已经验证的数据。
2. trim、transform、coerce 等转换结果只存在于 `parsedResult.data`。

如果校验后仍写入 `formValues`，`species` 的归一化就不会真正进入数据库。

## 3. Zod 的 input 与 output 不一定相同

普通字符串字段的输入和输出通常都是 `string`，但 preprocess、coerce、transform 和 default 会改变这个关系。

项目中的 age 是典型例子：

```ts
age: z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce.number().int().min(0).max(20).optional(),
)
```

浏览器的 `<input type="number">` 仍然产生字符串，例如 `'3'`，清空时产生 `''`。Schema 依次执行：

1. 把 `''` 变为 `undefined`。
2. 把非空输入转换为 number。
3. 检查整数和 `0–20` 范围。

因此 age 的原始输入可以是 string，但解析结果是 `number | undefined`。

需要区分这两个工具类型：

```ts
type PetInput = z.input<typeof createPetSchema>;
type PetOutput = z.output<typeof createPetSchema>;
```

`z.infer<typeof schema>` 等价于 `z.output<typeof schema>`。当 schema 大量使用 preprocess 或 transform 时，显式区分 input/output 会更清晰。

项目当前 create/edit 共用一个动态 schema，RHF 对两个 schema 的联合推断存在限制，所以 status 和服务端字段名使用了局部类型断言。若以后表单差异继续扩大，更清晰的方案是让 create/edit 各自创建一个类型明确的内部 RHF 实例，共享纯 UI 字段组件。

## 4. 如何获取并展示客户端校验错误

`Controller` 的 `fieldState.error` 是当前字段的客户端错误：

```tsx
<Controller
  name="name"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="pet-name">Name</FieldLabel>
      <Input
        {...field}
        id="pet-name"
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

几个属性分别负责：

- `field`：包含 `name/value/onChange/onBlur/ref`，把控件接入 RHF。
- `fieldState.invalid`：当前字段是否无效。
- `fieldState.error`：包含 Zod 提供的错误 message。
- `data-invalid`：让 Field 根据错误状态应用样式。
- `aria-invalid`：向辅助技术声明控件无效。
- `FieldError`：以 `role="alert"` 展示错误消息。

不要只改变边框颜色而不显示文字，也不要遗漏 `aria-invalid`。

## 5. 如何获取并展示服务端校验错误

### 5.1 Action 将 ZodError 转换成字段错误

`safeParse` 不会抛出校验异常，而是返回 discriminated union。失败时使用 `z.flattenError()`：

```ts
const { fieldErrors } = z.flattenError(parsedResult.error);

return {
  success: false,
  fieldErrors,
};
```

`fieldErrors` 的形状类似：

```ts
{
  name: ['Name must be at least 2 characters.'],
  shelterId: ['Please select shelter.'],
}
```

数组是因为一个字段可能同时产生多条错误。

### 5.2 页面通过 setError 写回 RHF

Action 返回后，将每个服务端错误写入 RHF：

```ts
for (const [fieldName, errors] of Object.entries(
  result.fieldErrors,
) as [keyof UpdatePetForm, string[]][]) {
  const message = errors[0];

  if (message) {
    form.setError(
      fieldName as Parameters<typeof form.setError>[0],
      { type: 'server', message },
    );
  }
}
```

一旦写入，原有的 `fieldState.error → FieldError` 渲染路径就会自动显示服务端错误，不需要维护第二套错误 UI。

`type: 'server'` 是人为定义的来源标签，不是特殊关键字。它便于以后区分 resolver 错误和服务端错误。

### 5.3 非字段错误使用 root

数据库失败、权限不足等错误无法归属某一个输入字段，应写到 root：

```ts
form.setError('root', {
  type: 'server',
  message: result.message,
});
```

页面统一展示：

```tsx
{form.formState.errors.root && (
  <Field data-invalid>
    <FieldError errors={[form.formState.errors.root]} />
  </Field>
)}
```

不要把数据库异常错误地挂到某个字段，也不要把 Prisma 原始错误直接展示给用户。

## 6. Server Action 应该抛错还是返回统一结果

答案不是“永远抛出”或“永远返回”，而是根据错误是否属于预期控制流决定。

### 6.1 复杂表单的预期失败：返回统一结果

本项目的表单 Action 使用 discriminated union：

```ts
type PetActionResult =
  | { success: true }
  | {
      success: false;
      message?: string;
      fieldErrors?: Partial<Record<keyof UpdatePetForm, string[]>>;
    };
```

适合转换并返回的情况：

- Zod 校验失败。
- 用户无权限执行操作。
- 可预期的业务冲突。
- 数据库操作失败后需要显示通用提示。

这样客户端可以通过 `result.success` 安全缩窄类型，并将 `fieldErrors` 与 `message` 分别放回字段和 root。

### 6.2 不应把原始异常返回给浏览器

下面的做法不安全：

```ts
// Do not do this.
return { success: false, message: String(error) };
```

Prisma 或数据库错误可能包含表名、约束、查询信息等实现细节。Action 应在服务端记录必要信息，并返回稳定、友好的通用消息。

### 6.3 什么时候允许抛出

适合抛出的情况包括：

- 调用方使用 TanStack Query mutation，并约定通过 rejected Promise 进入 `onError`。
- 错误不可恢复，交给最近的 error boundary 处理更合理。
- 框架控制流 API，例如 `redirect()`、`notFound()`；不要用宽泛的 `try/catch` 吞掉它们。

关键不是个人偏好，而是调用方协议必须统一。RHF 表单若期待 `PetActionResult`，Action 就不应一部分错误 return、一部分普通错误随意 throw，否则客户端需要维护两套处理流程。

## 7. shadcn/ui 常见控件写法

本项目安装的 shadcn 版本使用 `Field + Controller`。一些旧教程使用 `FormField/FormItem/FormMessage`，不要不加确认地照搬旧 API。

### 7.1 Input

```tsx
<Input
  {...field}
  id="pet-name"
  aria-invalid={fieldState.invalid}
  autoComplete="off"
/>
```

核心属性：

- `{...field}`：一次传入 RHF 的标准字段属性。
- `id`：必须与 `FieldLabel htmlFor` 对应。
- `aria-invalid`：声明错误状态。
- `type/min/max/step`：改善浏览器输入体验，但不能替代 Zod 服务端校验。

### 7.2 可选受控字段

React 受控 input 不应在 `undefined` 和 string 之间切换：

```tsx
<Input {...field} value={field.value ?? ''} />
```

页面用空字符串表示“尚未输入”，schema 再决定将它保留为空字符串、转换为 undefined，还是判定为错误。

### 7.3 Number Input

```tsx
<Input
  name={field.name}
  value={
    typeof field.value === 'string' || typeof field.value === 'number'
      ? field.value
      : ''
  }
  onChange={field.onChange}
  type="number"
  min={0}
  max={20}
  step={1}
/>
```

即使 `type="number"`，浏览器事件值仍通常是 string。最终类型转换必须由 Zod 或显式的 `valueAsNumber` 策略负责。

### 7.4 Select

Select 不是原生 input，不能只使用 `{...field}`：

```tsx
<Select value={field.value} onValueChange={field.onChange}>
  <SelectTrigger
    id="pet-gender"
    aria-invalid={fieldState.invalid}
    onBlur={field.onBlur}
  >
    <SelectValue placeholder="Select a gender" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={PetGender.MALE}>Male</SelectItem>
    <SelectItem value={PetGender.FEMALE}>Female</SelectItem>
  </SelectContent>
</Select>
```

核心属性：

- `value`：当前受控值。
- `onValueChange`：将组件值写回 RHF。
- `onBlur`：通知 RHF 字段已被触碰。
- `SelectItem value`：提交的真实值；子文本只是展示标签。
- `SelectTrigger`：键盘焦点、错误状态和 placeholder 的承载元素。

动态数据必须使用稳定 ID 作为 value，例如 shelter 使用 `shelter.id`，不要提交容易重名或变化的 `shelter.name`。

### 7.5 可自由输入的 Combobox

species 既可以选择数据库已有值，也可以输入新值，因此需要同时控制选择值和输入文本：

```tsx
<Combobox
  items={speciesList}
  value={field.value || null}
  inputValue={field.value}
  onInputValueChange={field.onChange}
  onValueChange={(value) => field.onChange(value ?? '')}
>
  <ComboboxInput
    ref={field.ref}
    onBlur={field.onBlur}
    showClear
  />
  <ComboboxContent>
    <ComboboxList>
      {speciesList.map((species) => (
        <ComboboxItem key={species} value={species}>
          {species}
        </ComboboxItem>
      ))}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

核心区别：

- `inputValue/onInputValueChange` 管理用户正在键入的文本。
- `value/onValueChange` 管理选中的候选项。
- 两条路径都写入同一个 RHF 字段，才能同时支持选择和自由输入。
- 下拉选项只是建议，不是允许值的枚举；最终仍由 Zod 归一化和校验。

### 7.6 Textarea 与字符计数

```tsx
<InputGroupTextarea
  {...field}
  value={field.value ?? ''}
  rows={6}
  aria-invalid={fieldState.invalid}
/>
<InputGroupText>
  {field.value?.length ?? 0}/500 characters
</InputGroupText>
```

字符计数只是提示。真正的最大长度限制仍在 Zod schema 中，避免只依赖 UI。

### 7.7 提交按钮

```tsx
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Saving...' : 'Create pet'}
</Button>
```

`isSubmitting` 用于阻止重复提交，并给用户明确反馈。如果按钮放在 `<form>` 外，需要通过相同的 `form="pet-form"` 与表单 `id` 关联。

## 8. Create/Edit 共用表单的边界

共用表单适合大多数字段相同的场景：

```ts
const isEditMode = mode === Mode.Edit;
const formSchema = isEditMode ? updatePetSchema : createPetSchema;
```

项目的 status 只在 edit 模式渲染。create 模式不仅隐藏 status，Server Action 还必须显式写死：

```ts
status: PetStatus.AVAILABLE
```

只在前端隐藏不构成安全边界。未来有人误把 status 加进创建表单，或者直接构造请求时，服务端规则仍然有效。

当 create/edit 的字段和行为差异逐渐增大时，不要为了“共用一个组件”不断增加断言和条件分支。可以改为：

- 外层 `PetForm` 根据 mode 选择 create/edit 内部组件。
- 两个内部组件分别使用类型明确的 schema 和 `useForm`。
- 共享无状态的字段布局组件。

复用的目标是减少重复业务逻辑，而不是强行只保留一个 RHF 实例。

## 9. 常见错误清单

### 校验与数据

- 只做客户端校验，没有在 Action 中重新校验。
- `safeParse` 成功后仍把原始 `formValues` 写入数据库。
- 把 transform 写在组件事件中，导致 Server Action 可绕过归一化。
- 使用 `.partial()` 放宽 update schema，但业务实际要求全量更新。
- 把数据库原始异常返回给页面。

### RHF 与控件

- 忘记提供稳定的 `defaultValues`。
- 可选 input 有时传 `undefined`、有时传 string，触发受控/非受控警告。
- 误以为 `<input type="number">` 自动产生 number。
- Select/Combobox 没有把 `onValueChange` 接回 `field.onChange`。
- 只显示错误边框，没有错误文字或 `aria-invalid`。
- 服务端字段错误另建一套 state，而不是复用 `form.setError()`。

### Server Action

- 依赖 TypeScript 参数类型，把 Action 输入当成可信数据。
- 依赖 middleware 权限检查，没有在 Action 内再次授权。
- 在 `'use server'` 文件导出 enum、常量等运行时值；这类共享值应放在普通模块中。
- 用宽泛 `try/catch` 捕获并吞掉 `redirect()` 或 `notFound()`。
- 成功写入后忘记按页面需求执行 revalidation 或导航。

## 10. 下次实现复杂表单时的顺序

1. 先定义 create/update schema，包括 trim、transform 和错误消息。
2. 明确 schema input/output 是否不同。
3. 定义 Action 的成功/失败联合返回类型。
4. 在 Action 中完成授权、safeParse 和 parsed data 写入。
5. 为页面准备稳定的 default values 和真实下拉数据。
6. 创建 RHF 实例并接入 `zodResolver`。
7. 用 Controller 逐个连接 shadcn 控件。
8. 展示客户端 `fieldState.error`。
9. 将服务端 `fieldErrors/message` 通过 `setError` 写回 RHF。
10. 增加提交中状态、成功后的导航/revalidation。
11. 运行 TypeScript、ESLint、production build，并在浏览器验证键盘操作、空值、错误和重复提交。
