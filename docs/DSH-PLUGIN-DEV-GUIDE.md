# DeepSeek Harness (DSH) 插件开发指南

> 基于 `@deepseek-ai/dsh` 系列包的**第一手源码**研究整理（研究对象：`dsh-workspace` 本地安装的 `node_modules/@deepseek-ai/*`，版本为 2026-08 开发者预览版）。
> 本文既是入门教程，也是 API 契约手册；所有结论都可以回到源码逐条验证。

---

## 目录

1. [总体架构：一切皆插件](#1-总体架构一切皆插件)
2. [开发环境与工作区](#2-开发环境与工作区)
3. [十分钟快速上手](#3-十分钟快速上手)
4. [Host 半区开发指南](#4-host-半区开发指南)
5. [Client 半区开发指南](#5-client-半区开发指南)
6. [主题插件专项](#6-主题插件专项)
7. [调试与故障排查](#7-调试与故障排查)
8. [发布与分发](#8-发布与分发)
9. [最佳实践与踩坑清单](#9-最佳实践与踩坑清单)
10. [参考资料](#10-参考资料)

---

## 1. 总体架构：一切皆插件

DSH（DeepSeek Harness）的整个运行时都是**插件化的**：模型、工具、Agent 循环、UI 面板、主题……全部是插件。底层运行时是 **Cordis**（`@deepseek-ai/cordis` + `cordis-plugin-loader`），插件通过 `apply(ctx)` 挂到上下文上，通过 `ctx.on / ctx.provide / ctx.inject` 做事件、服务与依赖装配。

### 1.1 两类插件：动态插件 vs 正式插件

| 维度 | 动态插件（Dynamic Package） | 正式插件（正式包） |
|---|---|---|
| 来源 | 会话中由 AI 用 `cordis_define` 现场创建 | 源码仓库中的 npm 包 |
| 形态 | `host.js`（Host 半区）+ `client.js`（Client 半区）两个纯 JS 函数体 | 完整的 TS 包，经构建、发布、加载 |
| 生命周期 | **会话级**：`cordis_stop`/`cordis_undefine`/重启即消失 | 随 Harness 常驻 |
| 代码能力 | 纯 JS 函数体（无 import/JSX/TS），运行在 vm 沙箱 + 浏览器闭包 | 完整语言能力 |
| 适用 | 原型、实验、现场调试、轻量 UI 贡献 | 生产交付 |

本指南以**动态插件**为主线（这是工作区 `dsh-workspace` 的日常开发方式），正式插件的 API 与之一致，只是工程形态不同。

### 1.2 双半区模型

一个插件 = 最多两个半区，运行在两个不同的地方：

```
┌──────────────────────── 你的插件 ────────────────────────┐
│                                                          │
│  code.host（Host 半区）          code.client（Client 半区） │
│  · 运行在 Node 服务进程          · 运行在浏览器页面          │
│  · vm 沙箱中求值                 · 闭包函数求值              │
│  · 访问 fs/bash/settings 等      · 访问 slots/theme 等       │
│  · 定义 RPC 方法 + 动态工具       · 渲染 React UI + 调 RPC    │
│                                                          │
│         harness.handle('m', fn) ⇄ host.call('m', args)    │
│                   （双向只传 JSON）                        │
└──────────────────────────────────────────────────────────┘
```

- **Host 半区**：有文件系统、命令行、设置等特权能力；浏览器半区没有。
- **Client 半区**：唯一能碰 UI 的半区；通过 `host.call` 把请求发回 Host 半区执行。
- 一个插件可以只有 Host 半区（纯后台），也可以只有 Client 半区（纯 UI，比如主题插件），也可以两个都有（比如 `one-click-launcher`）。

### 1.3 动态插件的五个动词（cordis 工具集）

由 `@deepseek-ai/dsh-tool-cordis` 提供给会话模型：

| 工具 | 作用 |
|---|---|
| `cordis_define` | 登记一个包（`name`、`purpose`、`code.host`、`code.client`）。语法预检，不运行。返回 `dyn-<n>` 标识 |
| `cordis_run` | 激活：Host 半区进沙箱求值，Client 半区投递给每个打开的页面（浏览器需批准授权） |
| `cordis_stop` | 停掉包：Host dispose，页面撤回 Client 半区；定义仍保留 |
| `cordis_undefine` | 先停后忘：删除定义 |
| `cordis_inspect` | 只读诊断：服务、活插件 fiber、动态包、API/事件反射、Client 插槽目录 |

> **核心心智**：动态插件是**进程内存**里的东西。重启 Harness 就没了。要持久，就把 `host.js`/`client.js` 落盘到工作区（见第 8 节）。

---

## 2. 开发环境与工作区

### 2.1 工作区结构

```
deepseekH\                        # dsh-workspace（主仓）
├── plugins\
│   ├── one-click-launcher\       # ⚡ 已完成插件（最佳参考实现）
│   │   └── plugin\host.js, client.js, INSTALL.md
│   └── eye\                      # 👁 骨架插件
├── package.json                  # scripts: { dsh: "dsh web" }
└── start-dsh.bat                 # 本地启动器（不入库）
```

开发流程：改 `plugins/<name>/` 下的 `host.js`/`client.js` → 在本工作区启动的 DSH 会话里用 `cordis_define` 加载调试 → 成熟后独立建仓 + 用 `git submodule add` 挂回主仓。

### 2.2 第一手 API 资料：读源码

DSH 的 API 文档散落在各包的 `README*.md` 与生成目录里，**最可靠的契约来源是本地安装的源码**：

```
node_modules/@deepseek-ai/
├── dsh-tool-cordis/            # cordis 五动词 + 生成的 Client 插槽目录 + API 反射
├── dsh-cordis-host-runner/     # Host 半区沙箱、harness 全局
├── dsh-cordis-client-runner/   # Client 闭包、ctx 门面、插槽/主题专用座位、插槽目录数据
├── dsh-client-ui-slots/        # 插槽注册 API（SlotMap、register、inject face）
├── dsh-client-ui-theme/        # ThemeRuntime、token 样式表（design-platform.css 是 token 全表）
├── dsh-client-ui-layout/       # ThemePresenter（快照 → DOM）
└── dsh-client-ui-*/            # 各 UI 包的 slots.d.ts = 该领域可扩展的插槽契约
```

**建议的调研套路**：
1. 在会话里问 AI：`cordis_inspect`（`what: "client"` 看全部插槽，`what: "api"` 看服务签名，`what: "events"` 看事件）。
2. 需要精确契约时，让 AI 直接读 `node_modules/@deepseek-ai/<包>/README.md` 与 `lib/types/**/*.d.ts`。
3. 想抄可运行模式时，看 `dsh-cordis-client-runner/lib/client.js` 里每个插槽的 `example` 字段（官方可运行示例）。

---

## 3. 十分钟快速上手

### 3.1 最小 Host 半区（`host.js`）

```js
// ============================================================
//  最小 Host 半区 — 粘贴到 cordis_define -> code.host
// ============================================================
return {
  apply(ctx) {
    // 可选服务一律 ctx.get + 判空（服务没起来就安静退出，别让插件挂掉）
    const fs = ctx.get('fs')
    if (fs === undefined) return

    const disposers = []

    // 1) 注册一个客户端可调用的 RPC 方法（返回 disposer）
    disposers.push(harness.handle('hello.world', async (args) => {
      return { echo: args, at: new Date().toISOString() }
    }))

    // 2) 注册一个动态工具（返回 disposer）
    const tool = harness.defineTool({
      name: 'hello_tool',
      description: 'A minimal dynamic tool.',
      parameters: { type: 'object', properties: {} },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            message: { type: 'string', required: true },
          },
        },
        render(args, value) {
          return [{ type: 'text', text: value.message }]   // 必须返回内容块数组
        },
      },
      execute: async () => ({ message: 'hello from a dynamic plugin' }),
    })
    disposers.push(harness.registerTool(ctx, tool))

    // 3) 卸载时统一清理（apply 返回 disposer 函数）
    return () => { for (const d of disposers) if (typeof d === 'function') d() }
  },
}
```

### 3.2 最小 Client 半区（`client.js`）

```js
// ============================================================
//  最小 Client 半区 — 粘贴到 cordis_define -> code.client
// ============================================================
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    // 侧边栏底部加一个按钮（参考 one-click-launcher 的成品写法）
    const HelloButton = () => {
      const [text, setText] = React.useState('')
      const onClick = async () => {
        const result = await host.call('hello.world', { hi: 'there' })  // RPC → Host 半区
        setText(JSON.stringify(result))
      }
      return React.createElement('div', null,
        React.createElement('button', { onClick, style: { margin: '0 6px', cursor: 'pointer' } }, '👋 打招呼'),
        React.createElement('span', { style: { fontSize: 11, margin: '0 6px' } }, text),
      )
    }

    slots.inject('sidebar.footer.action', () => slots.register(
      { name: 'sidebar.footer.action', id: 'hello-button', order: 100, label: () => '打招呼' },
      () => React.createElement(HelloButton),
    ))
  },
}
```

### 3.3 安装流程（每一轮开发都这样）

1. 会话中让 AI 执行 `cordis_define`：`kind: "new"` + `idPrefix`（3–6 个小写字母，如 `hello`）；修改已有插件用 `kind: "existing"` + 原 pluginId。
2. `code.host` ← `host.js` 全文；`code.client` ← `client.js` 全文。
3. `cordis_run` 激活（首次 `run` / 换版本 `update`）。Client 包需要你在界面**批准授权**。
4. 失败修法：`cordis_inspect` 诊断 → `cordis_define` 追加一个新 Package（不要覆盖旧包）→ 重新 `cordis_run`。
5. 产物要**落盘**才持久（`cordis_define` 只存在会话内存里）。

---

## 4. Host 半区开发指南

### 4.1 插件形态与生命周期

- `code.host` 是一个**纯 JS 函数体**，求值后必须 `return` 一个插件：函数 `(ctx) => {…}` 或对象 `{ name?, inject?, apply(ctx) {…} }`。**禁 JSX/TS/import**。
- `apply(ctx)` 里注册的一切（handler、tool、监听器）都要收集 disposer；`apply` **返回一个 disposer 函数**，卸载时统一执行。忘了返回 → 停止插件时贡献残留。
- `ctx.on('event', fn)` / `ctx.provide(name, service)` / `ctx.effect(fn, label)` 是框架自带的清理路径（生命周期结束时自动释放），`ctx.effect` 是首选的副作用注册方式。

### 4.2 服务访问契约

```js
// 推荐：可选服务 — ctx.get + 判空，服务缺席就安静退出
const fs = ctx.get('fs')
if (fs === undefined) return

// 硬依赖：在插件对象上声明 inject，运行时会等它就绪，服务卸载时自动 park 插件
return {
  inject: ['fs', 'sandboxPolicy'],
  apply(ctx) { /* ctx.fs / ctx.sandboxPolicy 直接可用 */ },
}
```

Host 半区常见服务（以 `cordis_inspect what: "api"` 为准）：

| 服务 | 用途 |
|---|---|
| `fs` | 文件系统（`resolve` / `readText` / `writeText` / `list` …） |
| `sandboxPolicy` | 沙箱策略（`resolve()` 返回含 `workspaceRoot` 的策略对象） |
| `bash` / `terminal` | 执行命令（有沙箱约束） |
| `web` | HTTP 能力 |
| `settings` | 用户设置（`register` 命名空间 + schema） |
| `tools` | 工具注册中心（动态工具经由 `harness.registerTool` 走） |

### 4.3 文件与沙箱（常见需求：往工作区写文件）

```js
const fs = ctx.get('fs')
const sandboxPolicy = ctx.get('sandboxPolicy')
if (fs === undefined || sandboxPolicy === undefined) return

const generate = async () => {
  const policy = sandboxPolicy.resolve()
  const root = policy.workspaceRoot || sandboxPolicy.workspaceRoot
  const target = await fs.resolve('my-file.txt', { cwd: root })
  const outcome = await fs.writeText(target, '内容', undefined, undefined, policy)
  return { ok: true, workspace: root }
}
```

> 参考 `plugins/one-click-launcher/plugin/host.js`：它用这套契约把 `start-dsh.bat`（base64 内嵌 exe）写进工作区。

### 4.4 客户端 RPC（Host ⇄ Client）

```js
// Host 半区：注册方法，返回 disposer
const dispose = harness.handle('launcher.install', async (args) => {
  try { return await generate() }
  catch (err) { return { ok: false, error: String(err && err.message || err) } }
})

// Client 半区：调用（双向只传 JSON）
const result = await host.call('launcher.install', {})
```

**契约要点**：
- 方法名习惯用 `插件名.动词` 命名空间（如 `launcher.install`）。
- 只传 JSON。客户端不带参数调用时，Host 侧收到 `null`（`undefined` 不是 JSON）。
- 错误不要 throw 出 wire：在 handler 里 catch 后返回 `{ ok: false, error }`，由 UI 展示。

### 4.5 动态工具（让模型能用你的插件）

三步走，**每一步都有严格的契约**（踩坑重灾区，务必照抄）：

```js
const tool = harness.defineTool({
  name: 'install_one_click_launcher',
  description: '…给模型的描述…',
  parameters: { type: 'object', properties: { /* JSON Schema，可选 */ } },

  // ① output.schema 用"值模式 DSL"：
  //    - 必填是属性级 { type: 'boolean', required: true }，没有顶层 required 数组！
  //    - object 必须显式写 additionalProperties: true | false
  output: {
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        ok: { type: 'boolean', required: true },
        workspace: { type: 'string' },
        message: { type: 'string', required: true },
      },
    },
    // ② render(args, value) 必须返回"内容块数组"
    render(args, value) {
      return [{ type: 'text', text: value && value.message ? value.message : String(value) }]
    },
  },

  // ③ execute(args, exec) 返回 JSON
  execute: async () => ({ ok: true, workspace: '…', message: '…' }),
})

// ④ 必须用 defineTool 的返回值注册，否则报错：
//    "dynamic tool registration must use a tool returned by harness.defineTool"
disposers.push(harness.registerTool(ctx, tool))
```

### 4.6 清理纪律

```js
const disposers = []
disposers.push(harness.handle('x.y', fn))
disposers.push(harness.registerTool(ctx, tool))
// 别忘了 apply 返回的 disposer
return () => { for (const d of disposers) if (typeof d === 'function') d() }
```

---

## 5. Client 半区开发指南

### 5.1 闭包环境（你能拿到什么）

`code.client` 被包进 `new Function("React", "console", "styles", "host", "harness", …)` 求值：

| 全局 | 说明 |
|---|---|
| `React` | React 运行时，**无 JSX**：`React.createElement(type, props, ...children)`、`React.useState`、`React.useEffect` |
| `host` | `host.call(method, args)` → 调本插件的 Host 半区 handler（`harness.handle` 配对） |
| `styles` | 样式：`styles.insert(css)` 注入 CSS，卸载时自动移除 |
| `console` | 带插件标签的 console（错误会上报会话） |
| `harness` | **陷阱**：这里调用会报教学错误 —— `harness.*` 属于 Host 半区 |

**不存在的全局**（用到即报教学错误）：
- `fetch` → 网络属于 Host 半区：用 `harness.handle` + `host.call`。
- `require` / `import` → 无法导入模块：React 是闭包符号，其余走 ctx 服务或 host.call。
- `setTimeout` 等 timer 全局 → 需在插件上声明 `inject: ['timer']`，用 `ctx.setTimeout` 等，或放在 `React.useEffect` 里并返回清理函数。

### 5.2 ctx 门面（动态包专用的白名单代理）

Client 的 `ctx` 不是完整 Cordis Context，而是 `dsh-cordis-client-runner` 造的白名单代理：

- **可用动词**：`ctx.on / ctx.once / ctx.provide / ctx.effect` + timer 助手（`timeout/interval/setTimeout/setInterval/throttle/debounce`，需 `inject: ['timer']`）。
- **服务读取**：`ctx.get(name)` 做**可选**查找（推荐，配合判空）；`ctx.serviceName` 直接属性访问则**必须**在返回的插件上声明 `inject: ['name', …]`，否则门面直接拒绝（报"service not declared"）。
- **两个专用座位**：
  - `slots`：`register` 代理自动分配阴影优先级、记录账本、把 effect 挂到调用插件的 fiber 上。
  - `theme`：`overrideTokens` 的 source **强制替换为包 id**（见第 6 节）。
- 返回的 Context 一律被拒（`denyContext`）——别尝试跨 ctx 操作。

### 5.3 插槽系统（UI 扩展的唯一入口）

```
slots.inject('槽名', () => slots.register(
  { name: '槽名', id: '唯一id', order: 100, label: … },   // 选项
  () => React.createElement(YourComponent),               // 组件
))
```

**`slots.register` 选项**（各槽按需支持）：

| 选项 | 说明 |
|---|---|
| `name` | 目标槽名（必填；写成没声明过的槽会被门禁拒绝） |
| `id` | 注册项唯一键（list 型槽必填，如 `sidebar.footer.action`、`settings.general.item`） |
| `order` | 排序权重 |
| `label` | 可为函数（如侧边栏按钮的 `label: () => '启动器'`） |
| `key` | keyed 槽的键（如 `conversation.chat.node` 的 `'tool-call'`、`'command-input'`） |
| `select` | chain 槽的路由选择器（`owner => null` 即永不匹配） |
| `store` | 快照 store（`useStore` 座位） |
| `locale` | 声明词典命名空间，组件获得 `t` 座位 |
| `inject` | 业务面工厂 `(actions) => ({…})`，返回值成为组件的注入 props |

**基数（kind）**：`single`（单占用，注册即替换）、`list`（多占用，按 order 排队，如 `sidebar.footer.action`）、`keyed`（按 key 分发，如 `conversation.chat.node`）、`chain`（选择器路由，可叠加，如 `conversation.composer`）。

> 动态包注册的 `priority`（阴影优先级）由门面自动分配：**后注册的排前面**（shadow 语义）。

### 5.4 常用插槽目录（来自生成目录，注册前先用 `cordis_inspect what:"client"` 核实）

| 槽名 | 基数 | 用途 | 典型注册选项 |
|---|---|---|---|
| `sidebar.footer.action` | list | 侧边栏底部按钮 | `id` + `order` + `label`（可函数） |
| `settings.general.item` | list | 设置-通用区一行偏好项（外观/语言/回车行为都在这里） | `id` + `order`；行内自己画标签 |
| `settings.section` | single | 整个设置分区（大页面） | — |
| `settings.plugins.tab` / `settings.plugin.item` | single/list | 插件设置页的 tab / 插件卡片 | `id` + `order` |
| `conversation.session.header.actions` | list | 会话头部操作按钮 | `id` + `order` |
| `conversation.session.header.utilities` | list | 会话头部工具区 | `id` + `order` |
| `conversation.input.dock` | list | 输入区停靠位（目标条、队列、任务） | `id` + `order` |
| `conversation.input.left/right` | list | 输入框左右扩展 | `id` + `order` |
| `conversation.input.plan` / `conversation.input.model` | single | 计划模式开关位 / 模型选择位 | — |
| `conversation.input.overlay` | chain | 输入区覆盖层 | `select` |
| `conversation.chat.node` | keyed | 聊天节点视图（`'tool-call'`、`'command-input'`、`'workflow-run'` 等 key） | `key` |
| `conversation.chat.turnTail` | chain | 回合尾部追加 | `select` |
| `conversation.chat.assistant-actions` | single | 助手消息操作位 | — |
| `conversation.hero.workspace` | single | 无会话首页的工作区选择位 | — |
| `tool.view.cordis` | keyed | cordis 工具卡视图（key 固定 `"self"`，运行时绑定到你的包） | `key: "self"` |
| `conversation` / `sidebar` / `root` | single | 整面替换（会移除该面声明的所有子座位，慎用） | — |

> 想往某槽里注册，最稳的姿势：让 AI 读 `dsh-cordis-client-runner/lib/client.js` 里该槽的 `example` 字段 —— 那是有门禁保证的可运行示例。

### 5.5 组件写法

```js
const MyComponent = () => {
  const [state, setState] = React.useState({ busy: false, text: '' })
  React.useEffect(() => {
    // 副作用 + 清理
    return () => { /* 清理 */ }
  }, [])
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
    React.createElement('button', { onClick: …, disabled: state.busy }, '按钮'),
    React.createElement('span', { style: { fontSize: 11, color: '#2e7d32' } }, state.text),
  )
}
```

- **样式**：`styles.insert(css)`（卸载自动移除）或内联 `style`。组件类名别写死全局名，内联或注入带插件前缀的 CSS 类。
- **状态**：`React.useState/useEffect`；不提供 `defineStore` 之类的全局，需要跨挂载状态就在 `apply` 闭包里存变量，通过 `inject` 面暴露读写函数。

### 5.6 设置行模式（`settings.general.item` 的完整范式）

参考 `dsh-client-ui-theme` 的 AppearanceRow（外观行）：注册 `store` + `locale` + `inject` 三个座位，组件通过注入的 props 读写。动态包里没有 `defineStore` 全局，改用 **inject 面 + apply 闭包状态**（见 `plugins/dsh-aurora/client.js` 的完整实现）：

```js
slots.inject('settings.general.item', () => slots.register(
  {
    name: 'settings.general.item',
    id: 'my-row',
    order: 20,
    inject: () => ({                       // 返回值会作为 props 传给组件
      setEnabled: (on) => { /* 闭包里的读写 */ },
      isEnabled: () => enabled,
    }),
  },
  (props) => React.createElement(MyRow, props),   // props: { setEnabled, isEnabled }
))
```

---

## 6. 主题插件专项

主题是 DSH Web GUI 的一等扩展点。研究依据：`@deepseek-ai/dsh-client-ui-theme`（ThemeRuntime + token 样式表）、`@deepseek-ai/dsh-client-ui-layout`（ThemePresenter）。

### 6.1 Token 体系（三层的颜色权威）

```
--dsw-static-*           静态尺度层（色板：neutral/deepseek/blue/red/green/amber）
                         在 body 与 body[data-ds-dark-theme] 上各声明一份
        ↓
--dsw-alias-*            语义别名层（设计意图：bg-base/label-primary/brand-primary…）
                         body 声明浅色值；body[data-ds-dark-theme] 声明深色值
        ↓
--dsw-specific-*         领域专用（sidebar-fill、bubble、input-major…）
```

- **全部 alias/specific token 的完整清单和默认值**：`node_modules/@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css`（浅色块 + 深色块各一份）。
- 渲染管线（ThemePresenter，ui-layout）：`html { color-scheme }` → `body[data-ds-dark-theme]`（选基础色板）→ **把活动主题的 alias token 作为内联 CSS 变量写回 `body`** → 更新 `meta[name="theme-color"]`。
- 所以主题 = **覆盖同名 alias 变量**即可，其余自动跟随。

### 6.2 ThemeRuntime 服务（`ctx.get('theme')`）

```ts
// 事件
ctx.on('theme/change', (snapshot) => {…})   // snapshot: { preference, active, themes, revision }

// 方法
theme.getTheme()                // 当前不可变快照
theme.setTheme(id)              // 'light' | 'dark' | 'system' 或已注册第三方 id
theme.register(definition)      // 注册一个可选主题 → 返回 disposer
theme.overrideTokens(source, tokens)  // 叠加调色层 → 返回 disposer
theme.exportInspectTokens()     // 导出 token 目录（供 cordis_inspect 反射）
```

```ts
interface ThemeDefinition {
  id: string                    // 主题 id；'system' 是偏好不是主题，不可注册
  colorScheme: 'light' | 'dark' // 基于哪套基础色板（决定 body 属性，不是 id 决定的！）
  tokens: Record<string, string>// 别名 token → 字面值
}
```

### 6.3 两条扩展路：`register` vs `overrideTokens`

| | `theme.register({id, colorScheme, tokens})` | `theme.overrideTokens(source, tokens)` |
|---|---|---|
| 语义 | 新增一个**可选主题**（进 registry，可 `setTheme(id)` 切换） | 给当前活动主题**叠一层调色** |
| token 形态 | `{ token: '字面值' }`（单值，按自身 colorScheme 生效） | `{ token: { light: '…', dark: '…' } }`（双值，跟随系统/偏好切换） |
| 顺序 | 与内置 light/dark 并列 | 多层按 seq 叠加，后层逐 token 胜出 |
| 生命周期 | disposer；若它是活动偏好，卸载后偏好重置为默认 | disposer；动态包的门面会把它**自动挂在插件 fiber 上**，卸载即还原 |
| 备注 | **出厂外观设置里没有第三方主题的入口**（Appearance 只有 浅色/深色/跟随系统），注册后要靠你自己的 UI 调 `setTheme`；重名 id 抛错 | **动态主题包的标准姿势**：一套 `{light, dark}` 值同时覆盖两种模式，完全兼容用户的浅/深/跟随系统偏好 |

> 推荐：**做"一套主题"= 用 `overrideTokens` 提供一套完整的 `{light, dark}` 别名值**；需要多套可选主题时再叠加 `register` + 自建选择 UI。

### 6.4 动态包 theme 门面的三个细节（易踩坑）

1. **source 会被强制替换**为 `<pluginId>.<packageId>`：调用 `theme.overrideTokens('随便什么', tokens)` 即可，别依赖你传的 source。
2. **disposer 自动挂 fiber**：`ctx.effect` 已替你挂好 —— 插件卸载（stop/undefine/重启）时调色层自动移除，即使你丢了返回值也会还原。
3. **tokens 必须成对**：传 `{ token: '单值' }` 会抛教学错误（"pass { light, dark } pair"），因为单值在用户切换配色后无法可读。

### 6.5 完整示例

见本工作区 `plugins/dsh-aurora/`（极光主题）：
- `client.js` —— 激活即应用调色层 + 在 设置→通用 加一行开关（默认/极光）；
- `README.md` —— 安装步骤、设计说明、token 对照表；
- `preview.html` —— 纯静态配色预览（不装插件也能看效果）。

核心骨架：

```js
const TOKENS = {
  '--dsw-alias-bg-base':     { light: 'rgb(249, 251, 250)', dark: 'rgb(12, 18, 17)' },
  '--dsw-alias-brand-primary': { light: 'rgb(13, 148, 136)', dark: 'rgb(45, 212, 191)' },
  '--dsw-alias-label-primary': { light: 'rgb(24, 39, 37)',   dark: 'rgb(232, 247, 243)' },
  // …共 80 个核心 token（浅/深全量对照），见 client.js
}

return {
  apply(ctx) {
    const theme = ctx.get('theme')
    if (theme === undefined) return          // 主题服务缺席 → 安静退出
    let disposeTheme = theme.overrideTokens('aurora', TOKENS)  // 激活即生效
    // …（可选）设置行开关：setEnabled(false) 时执行 disposeTheme()，重新开启时再次 overrideTokens
  },
}
```

### 6.6 偏好持久化与首帧引导

- 内置偏好（light/dark/system）存于 Host 设置 `ui-theme.preference`（默认落盘 `$DSH_HOME/settings.yaml`）；Appearance 行的选择经 Host settings API 写入，跨浏览器同步。
- Host 在 index 响应里注入引导脚本：插件树激活前就把 `color-scheme` 和 `body[data-ds-dark-theme]` 设好，避免首帧闪烁。
- 第三方主题 id **不跨内置 schema**：只是进程内扩展；卸载时绝不会覆盖最后持久化的内置偏好。

---

## 7. 调试与故障排查

### 7.1 cordis_inspect（第一诊断工具）

```
cordis_inspect                          # 总览：服务、fiber、动态包、工具
cordis_inspect what:"api"               # 服务 API 反射（签名 + JSDoc）
cordis_inspect what:"events"            # 事件目录（含分发模式）
cordis_inspect what:"client"            # 全部插槽目录（每座位一行）
cordis_inspect what:"client" name:"settings.general.item"   # 单个槽的完整契约 + 示例
cordis_inspect what:"temporary"         # 动态包清单
```

### 7.2 失败修法（迭代循环）

1. `cordis_define` 失败 → 读错误（一般是语法预检或 schema 教学错误）。
2. `cordis_run` 失败 → `cordis_inspect` 看 host 半区报错、客户端确认状态。
3. **修改永远追加新 Package**（不覆盖旧包），再 `cordis_run`（`update` 换版本）→ 页面刷新后重新 `run` 可把包取回页面。
4. Client 渲染崩溃 → 崩溃会上报会话，提示里带教学文案（比如"用了被 withheld 的全局"）。

### 7.3 常见错误速查

| 错误 | 原因 | 修法 |
|---|---|---|
| `dynamic tool registration must use a tool returned by harness.defineTool` | registerTool 收到非 defineTool 返回值 | 直接传 `defineTool(...)` 的结果 |
| `theme override "…" is a bare string` | overrideTokens 传了单值 | 改成 `{ light, dark }` 对 |
| `client half returned undefined — did you forget return?` | 函数体没 `return` 插件 | 补 `return { apply(ctx){…} }` |
| `dynamic ctx does not expose "xxx"` | 用了未声明的服务属性 | `ctx.get('xxx')` 或加 `inject: ['xxx']` |
| `network belongs to the HOST half`（fetch 陷阱） | Client 半区用 fetch | 改 `harness.handle` + `host.call` |
| `harness.xxx belongs to the HOST half` | Client 半区用 harness | host 能力只能走 RPC |
| `service "x" is not declared by your plugin` | 属性访问未声明服务 | 返回的插件对象加 `inject` 数组 |
| `yield* (intermediate value) is not async iterable` | `llm/stream` 等 waterfall 监听器写成 `async` 函数（返回 Promise） | 改成 **async generator**：`async function* (payload, next) { …; yield* next() }` —— 调度器对监听器做 `yield* listener(...)` |
| `patch: entry "eye-host" not found` | 在 `$DSH_HOME/cordis.patch.yml`（home 补丁层）新增插件条目 | home 层是**覆盖层**只能改已有行；新增走 profile 自己的 `cordis.patch.yml` 的 `insert:` 块 |
| `adapter.providerRetryPolicy is not a function` | 注册 llm 适配器时少了基类方法 | 补 `providerRetryPolicy() {}`（还有 `providerInfo` 必须返回 `{id, name}`） |
| `listModels ERR: invalid or duplicate model metadata` | 透传别的 provider 的模型对象 | `model.provider` 必须 === 当前 provider,逐条重映射 |
| `UNABLE_TO_MASK_PATH ... 路径过长`（WinRT 打开文件） | 沙箱对**工作区路径**的遮蔽有 bug（长度检查溢出成负数） | 中间文件走**进程自己的 `$env:TEMP`**（沙箱重定向的 `dsh-*` 临时目录,WinRT 可开） |
| `COMPONENTNOTFOUND 0x88982F50` | WinRT OCR/WIC 解码不了格式（WebP 等）或字节被污染 | 先 sharp 统一转 PNG(≤2048px);确认字节没被沙箱桥污染(见下) |
| `w is not a function`（Client 渲染） | root 作用域插槽里调用 `useSessions` 钩子 | 用 `ctx.get('sessions').list.getSnapshot().current` 读当前会话 |
| `DUPLICATE_ADAPTER` | 永久插件与动态插件同时注册同一个 llm provider | 装了永久版就别再装会话级同名插件;或让永久版独占 |

---

## 8. 发布与分发

1. **落盘**：把调好的 `host.js`/`client.js` 存到工作区 `plugins/<name>/`（动态插件是会话级的，文件才是持久资产）。
2. **独立建仓**：`plugins/<name>/` 内 `git init` + 建 GitHub 仓库推送。
3. **挂回主仓**（目录里已有 .git 时是"Adding existing repo"直登记）：
   ```sh
   git submodule add https://github.com/<you>/dsh-<name>.git plugins/<name>
   ```
4. **装到其他 DSH 会话**：把 `host.js`/`client.js` 全文喂给对方的 `cordis_define`（同 3.3 节流程）。
5. 分发物里写清 `INSTALL.md`（参考 `plugins/one-click-launcher/plugin/INSTALL.md`）。

### 8.1 真正持久化：从动态插件升级为正式插件

动态插件（cordis_define）只活在进程内存里，重启即失。**持久化 = 让 loader 树在启动时激活你的包**。机制（研究自 `@deepseek-ai/dsh-app-boot` / `dsh-client-modules` / `cordis-plugin-loader` / `cordis-plugin-include`）：

```
$DSH_HOME/                      # 默认 ~/.dsh(可被 DSH_HOME 环境变量覆盖)
├── settings.yaml               # 用户设置(主题偏好 ui-theme.preference 等)
├── cordis.patch.yml            # 机器本地补丁层(对所有 profile 生效,优先级最高)
└── profiles/
    ├── node_modules/           # 扁平依赖闭包(profile 依赖解析的后备)
    └── <name>/                 # 一个 profile 一个目录(web 是 --profile web)
        ├── cordis.yml          # 根条目文件(空列表,别编辑)
        ├── cordis.patch.yml    # ★ 用户补丁层:热重载,日常加插件就改这里
        ├── package.json        # dependencies + dsh.profile.bundles(有层序的 bundle 列表)
        └── pnpm-workspace.yaml # pnpm 设置(nodeLinker: hoisted)
```

**层栈顺序**（启动时按序叠加）：bundle layers（`dsh.profile.bundles` 顺序）→ profile 自己的 `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml` → `--patch` 覆盖层。

**补丁语义**（`applyEntryPatches`，顶层 YAML 数组）：

```yaml
# 插入新条目(loader 树顶层追加;条目 = { id, name, config, group, disabled, inject })
- insert:
    - id: my-plugin
      name: my-plugin            # 模块说明符:包名(node_modules)或相对路径(相对 profile 目录)
      config: { enabled: true }
# 或定向覆盖已有条目
- id: my-plugin
  config: { enabled: false }
```

**浏览器半区如何到达页面**（`dsh-client-modules`）：Host 扫描 loader 树里**存活的条目**（`entry.fiber` 存在且未 disabled），对声明了 `dsh.client` 的包：
- 解析 `exports["./client"]` → 浏览器 bundle 路径 → 提供 `/plugins/<id>/client.js?rev=<hash>`；
- 把 graph 注入 `window.__DSH_BOOT__`，浏览器端 vendored loader 按 `dsh.client.inject` 依赖边激活。

**一个正式插件的包形态**（参考本工作区 `plugins/dsh-aurora/persist/`）：

```jsonc
{
  "name": "dsh-aurora",
  "type": "module",
  "main": "./index.js",
  "exports": { ".": "./index.js", "./client": "./client.js" },
  "dsh": {
    "client": { "platform": "web", "inject": ["@deepseek-ai/dsh-client-ui-slots"] },
    "bundle": { "patch": "./cordis.patch.yml" }   // 声明 bundle:CLI 安装后自动进层栈
  }
}
```

- `index.js`：Host 半区，**必须有可激活的 apply**（空 apply 也行）——条目在 Host 侧激活失败，client 图直接不含它，浏览器半区永远不会到达；
- `client.js`：浏览器 bundle，协议是 `window.__ModuleLoader__.load({ id: '<包名>', factory: (require) => {...} })`，factory 返回模块导出（loader 取 `exports.default ?? exports`）；`require` 可解析平台种子字（`react`、`react/jsx-runtime`、`@deepseek-ai/cordis` 等，见 `@deepseek-ai/dsh-client-web` 的 PLATFORM_MODULES）；
- 静态插件的 ctx 是**完整 Cordis Context**（不是动态门面），`ctx.get('theme')` 照常可用；但 `overrideTokens` 的 source **不会被自动替换**、卸载也不会自动还原 —— apply 要显式收集 disposer 并返回清理函数。

**两条安装路线**：

```sh
# 路线 A:官方 CLI(需要 pnpm)
npm i -g pnpm
dsh plugin --profile web add file:D:/path/to/dsh-aurora   # link: 前缀 = 符号链接,迭代开发用
# → 自动 reconcile:dsh.bundle 声明 → 加入 dsh.profile.bundles 层栈;重启 dsh 生效

# 路线 B:手动(免 pnpm)
# 1. 把包目录复制到两处 node_modules(见下) —— 这是 client 图能组合的硬前提
# 2. 编辑 $DSH_HOME/profiles/web/cordis.patch.yml:
#    - insert:
#        - id: dsh-aurora
#          name: dsh-aurora            # ★ 必须是包名,见下
# 3. 重启 dsh(web profile 的 cordis-plugin-hmr 默认 disabled,补丁不热生效)
```

> ⚠️ **实测踩坑（bundle 404 三连，最终定位）**：
> 1. **entry `name` 必须是包名**。`dsh-client-modules` 的 `resolvePkgJson = (spec) => require.resolve(spec + '/package.json')` —— 它从 client-modules 自己的位置向上解析 **node_modules**；写相对路径（`./dsh-aurora/index.js`）或 file URL 都永远解析不到，`pkgMeta=null` → 条目不进 client 图 → `/plugins/<id>/client.js` 返回 404。即使 Host 条目激活成功也白搭。
> 2. **包必须同时存在于两处 node_modules**：
>    - `node_modules/dsh-aurora/`（DSH **安装闭包**，如 `D:\...\deepseekH\node_modules`）—— client-modules 的 `require.resolve` 基准；
>    - `$DSH_HOME/profiles/web/node_modules/dsh-aurora/` —— loader 的 ESM 解析基准（`internal.import('dsh-aurora', baseUrl)` 从 profile 目录向上找）。
> 3. **exports 必须含 `"./package.json"`**（官方包都带）：`require.resolve('pkg/package.json')` 遵守 exports 字段，不导出会 `ERR_PACKAGE_PATH_NOT_EXPORTED`。
> 4. 诊断顺序：`dsh --profile web --dump-config` 看条目在不在树里 → 浏览器开 `/plugins/<id>/client.js` 看 200/404 → 404 就查上面三条。装完跑过 `npm install`（会 prune 手放包）要重装 —— 参考 `plugins/dsh-aurora/persist/install.ps1` 的一键脚本写法。

**检查与卸载**：`dsh --profile web --dump-config` 可离线查看组合后的树；卸载 = 删 patch 条目（或 `dsh plugin --profile web remove <pkg>`）+ 重启。`dsh --dump-config` 与运行中的树不会漂移（同一份 applyEntryPatches）。

### 8.2 安装方式权威对照（参考社区项目实测）

社区两个参考项目的结论（2026-08 实测）：

- **dsh-visualize**：`@dsh-external/dsh-visualize` —— **bundle 类**插件。`package.json` 声明 `dsh.bundle.patch: "./cordis.patch.yml"`（包自带 `insert:` 块）；安装 = `dsh plugin --profile web add github:Nagi-ovo/dsh-visualize`（GitHub 源支持锁定 commit：`github:owner/repo#commit`；本地开发用 `dsh plugin add .`）。`dsh plugin` 命令会交给 profile 的 pnpm，并把声明了 `dsh.bundle` 的包加入 `dsh.profile.bundles` 层栈。
- **dsh-find-plugins**：`skills/find-plugins/references/install-methods.md` 给出了**安装方式权威矩阵**：

| 类别 | 判定 | 安装 |
|---|---|---|
| **bundle** | `package.json` 有 `dsh.bundle.patch` | `dsh plugin --profile <p> add <spec>`；成功后自动进 `dsh.profile.bundles` |
| **cordis**（裸插件,无自带 patch） | 普通 Cordis 插件 | ① `dsh plugin --profile <p> add <spec>` 装进 profile 依赖；② 在 `$DSH_HOME/profiles/<p>/cordis.patch.yml` 加 `insert:` 条目（`- insert: [- name: '<包名>', config: {}]`） |
| **skill** | 分发 `SKILL.md` 目录 | 拷进任一发现根（`<项目>/.agents/skills/`、`$DSH_HOME/skills/`、`${DSH_AGENTS_HOME:-~/.agents}/skills/`），watcher 即时生效,免重启 |
| **repository** | 旧格式 `.dsh-plugin` | **已移除**,不能安装,需迁移为 bundle |
| marisa / mygo | 社区管理器 | 由管理器接管（`dshx install` / 设置页插件面板） |

> ⚠️ **实测坑：`$DSH_HOME/cordis.patch.yml`（home 补丁层）不能新增条目**。
> 层栈注释写它"对所有 profile 生效",但实测在 home patch 里放新插件的 `insert:`/裸行,启动时报：
> `patch: entry "eye-host" not found` —— 该层被当作**覆盖层**（只能改已存在条目的 id/config/disabled）,不能新增。**新增插件只能在 profile 自己的 `cordis.patch.yml` 里 `insert:`**（或 bundle 自带 patch）。home patch 只适合全局覆盖已有行的配置。

**裸 cordis 插件手工安装（免 pnpm,eye 实战验证）**：
1. 包目录放 `$DSH_HOME/profiles/<p>/<pkg>/`（loader 以 profile 目录为 ESM 解析锚点）
2. 同时复制到 `$DSH_HOME/profiles/<p>/node_modules/<pkg>/`（保证解析）+（如需浏览器半区）DSH 安装闭包 `node_modules/`
3. profile 的 `cordis.patch.yml` 加：
   ```yaml
   - insert:
       - id: <pkg>
         name: <pkg>      # ★ 必须是包名(见 8.1 bundle 404 坑),相对路径永远解析不到
   ```
4. `dsh --profile web --dump-config` 验证条目进树,重启生效；卸载 = 删条目 + 删包目录,重启

> 依赖纪律：profile 目录外的包依赖（如 `@deepseek-ai/dsh-tools`）**解析不到**——放进去前先确认包零外部依赖,或把依赖也放进同一 `node_modules` 闭包（`require('…')` 会从包目录向上找）。eye 的永久版就是用"纯 JSON-schema 形式工具 + 零 require"做到的。

---

## 9. 最佳实践与踩坑清单

**Host 半区**
- 服务一律 `ctx.get('name')` + 判空；真的硬依赖才 `inject`。
- `harness.handle` / `registerTool` 返回的 disposer 全部收进数组，`apply` 统一返回清理函数。
- RPC 只传 JSON；异常在 handler 内 catch 成 `{ ok: false, error }`。
- 动态工具 schema 用**值模式 DSL**：必填在属性级、object 显式 `additionalProperties`、`render` 返回内容块数组。
- 写文件走 `sandboxPolicy.resolve()` → `fs.resolve(name, {cwd: root})` → `fs.writeText(target, content, undefined, undefined, policy)`。

**Client 半区**
- 没有 JSX/import/fetch/require/timer 全局；一切用 `React.createElement`、ctx 服务、`host.call`。
- `slots.register` 必须带 `name`；list 槽带唯一 `id`；先 `cordis_inspect what:"client"` 查契约再注册。
- 后注册的 list 项排前面（阴影优先级自动分配）；`single` 槽注册会**替换出厂 UI**，注册前想清楚。
- 样式用 `styles.insert(css)`（自动清理）或内联 style。

**通用**
- 动态插件是会话内存：重启即失，产物立刻落盘。
- 改完代码用 `cordis_define` **追加**新 Package 再 `update`，别覆盖。
- 沙箱是约束不是安全边界；给模型动态工具 = 授予接近 bash 的信任。

**Windows 专项（工作区经验）**
- bat 必须 CRLF + 纯 ASCII，避免多行括号块（用 `goto`），否则 cmd 解析闪退。
- 受限沙箱下 PowerShell/curl/git 的 HTTPS 会报 `SEC_E_NO_CREDENTIALS`，需要提权重试；Node 自带 TLS 不受影响。
- `git submodule add` 需要完整权限。

**eye 视觉桥专项（2026-08 实战,给纯文本模型配"外挂的眼睛"）**

- **沙箱桥会污染二进制字节（最大暗坑）**：动态插件 Host 半区在 VM 沙箱里,`attachments.readImage`/`fs.readBytes` 返回的 `Uint8Array` 过桥时被**按 UTF-8 重编码**,任何 ≥0x80 的字节变成两字节（PNG 魔数 `0x89` → `C2 89`）,sharp/WIC 全部报"格式不支持"。**症状识别**：解码文件头魔数出现 `C2 89 50 4E 47` 这种"UTF-8 重编码痕迹"。**解法**：图片字节永远不过沙箱桥——把 `attachmentId`(`sha256:<hex>`,路径=`$DSH_HOME/attachments/v1/objects/<前2位>/<hex>`)或文件路径传给子进程,让 node/powershell 直接读盘。
- **发送受理门**：聊天上传图片在 API proxy 的 prompt 处理就被拒（检查当前模型 `inputModalities`,纯文本模型直接打回 `MODEL_DOES_NOT_SUPPORT_IMAGES`）,`llm/stream` 拦截根本轮不到。**解法**：注册一个**虚拟 provider**（如 `eye-vision`,`resolveModel` 返回 `inputModalities: ['text','image']`、`stream` 原样转发给真实 provider）,模型路由指到它即可绕过;转发目标 id 要查真实部署（实测是 `deepseek-official` 不是 `deepseek`）。
- **llm/stream 拦截 = 模型调用瀑布**：waterfall 监听器必须是 async generator;请求是深度冻结的(不能改),转换图片块后**重入 `llm.stream({...options, messages: 转换后})**。
- **WinRT OCR**：上限约 2600px(超了 RecognizeAsync 抛错);走 PowerShell 5.1 + `StorageFile.GetFileFromPathAsync`,中间文件必须放进程自己的 `$env:TEMP`(沙箱重定向的 `dsh-*` 临时目录;工作区路径会撞 `UNABLE_TO_MASK_PATH` 沙箱 bug)。
- **配置持久化**：设置页(`settings.section` 插槽)经 `harness.handle` RPC 读写 `.eye/eye.config.json`;`selectModel` RPC 会把默认模型持久化到 `$DSH_HOME/settings.yaml`,重启后自动生效。
- **永久 vs 会话级冲突**：永久插件(profile bundle)注册了 provider 后,会话级动态插件再注册同 provider 报 `DUPLICATE_ADAPTER`——二选一,别叠装。

**永久版(原生插件)与动态插件的差异**
- 原生插件没有 `harness` 全局:工具用 `ctx.tools.register(definition)`(传**已编译的 JSON-schema 形式**,属性级 required 换成顶层 `required: []` 数组即可),RPC 不可用(设置页需要动态插件或 settings 服务)。
- 原生插件可以 `require`,但包放在 profile 目录时**外部依赖解析不到**——尽量零依赖,或把依赖塞进同一 node_modules 闭包。

---

## 10. 参考资料

**官方**
- DeepSeek Harness 主仓：<https://github.com/deepseek-ai/deepseek-harness>
- 本工作区 `dsh-workspace`：<https://github.com/wenliang9527/dsh-workspace>
- 成品参考插件 `dsh-one-click-launcher`：<https://github.com/wenliang9527/dsh-one-click-launcher>
- 骨架插件 `dsh-eye`：<https://github.com/wenliang9527/dsh-eye>

**社区参考项目（安装方式实测）**
- dsh-visualize（bundle 类插件 + tsdown 构建 host/client）:<https://github.com/Nagi-ovo/dsh-visualize>
- dsh-find-plugins（skill 分发 + 安装方式权威矩阵）:<https://github.com/Nagi-ovo/dsh-find-plugins>（`skills/find-plugins/references/install-methods.md`）
- 社区 plugin-registry（设置 → 插件 安装源）:<https://github.com/dsh-external/plugin-registry>

**本地源码（权威契约，按需精读）**
- `node_modules/@deepseek-ai/dsh-tool-cordis/README.zh.md` —— cordis 五动词、插槽目录生成机制、信任立场
- `node_modules/@deepseek-ai/dsh-cordis-client-runner/lib/client.js` —— Client 闭包、ctx 门面、`guardedTheme`/`guardedSlots`、每槽示例
- `node_modules/@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css` —— **token 全表（浅/深两套默认值）**
- `node_modules/@deepseek-ai/dsh-client-ui-theme/lib/types/client/index.d.ts` —— ThemeRuntime / ThemeDefinition / ThemeTokenOverrides
- `node_modules/@deepseek-ai/dsh-client-ui-layout/lib/types/client/theme-presenter.d.ts` —— 快照 → DOM 渲染管线
- `node_modules/@deepseek-ai/dsh-client-ui-slots/lib/types/index.d.ts` —— 插槽注册 API
- 本工作区 `DEV-NOTES.md` —— eye 插件开发上下文固化笔记（踩坑总结）

**相关文章（Harness 生态介绍）**
- [DeepSeek Harness：一切皆插件](https://www.pcd.com.cn/technews/202608/149618.html)
- [像玩乐高一样拼插件，DeepSeek Harness 能带来哪些改变？](https://www.jiemian.com/article/14922169.html)
- [DeepSeek Harness 2026：一切皆插件 — 开发者预览版完全指南](https://www.cnblogs.com/sing1ee/p/22455466)
