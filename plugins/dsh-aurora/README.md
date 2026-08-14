# 🎨 dsh-aurora — 主题集（8 套）

为 DeepSeek Harness Web GUI 设计的**8 套主题**（每套含浅色 / 深色双形态，跟随系统偏好）。全部主题共用一套 token 生成器（每套 12 个核心色板参数 → 80 个 `--dsw-*` 语义 token），保证各套内部的层次与对比关系一致。

- **形态**：DSH 动态插件（仅 Client 半区，纯前端，无权限请求）；另有 `persist/` 持久化版
- **机制**：`theme.overrideTokens` 叠加调色层 —— 覆盖 `--dsw-alias-*` / `--dsw-specific-*` 语义 token，**浅色与深色各一套值**，兼容"浅色 / 深色 / 跟随系统"三种偏好
- **切换**：设置 → 通用 →「🎨 主题」选择行（8 个色块，点击即切换）
- **安装方式**：把 `client.js` 全文粘贴给 DSH 会话中的 `cordis_define`（`code.client`），`cordis_run` 激活即生效
- **还原**：`cordis_stop` / `cordis_undefine` / 重启 Harness，配色自动还原为出厂

---

## 🎨 8 套主题一览

| 主题 | 色板（浅色主色 / 深色主色） | 气质 |
|---|---|---|
| 🌀 **极光** aurora | 青碧 `#0d9488` / 亮青 `#2dd4bf` | 冷静通透 · 深海质感 |
| 🌸 **樱花** sakura | 玫红 `#db2777` / 亮粉 `#f472b6` | 温柔甜美 · 粉调 |
| 🎋 **竹影** bamboo | 竹绿 `#4d7c0f` / 嫩绿 `#a3e635` | 清雅自然 · 抹茶系 |
| 🟣 **紫罗兰** violet | 紫 `#7c3aed` / 淡紫 `#a78bfa` | 神秘优雅 · 紫色系 |
| 🔶 **琥珀** amber | 焦橙 `#d97706` / 琥珀 `#fbbf24` | 温暖醇厚 · 秋日系 |
| 🌊 **深海** abyss | 蓝 `#1d4ed8` / 亮蓝 `#60a5fa` | 冷静专业 · 蓝色系 |
| ⬛ **石墨** graphite | 石墨黑 `#111827` / 银灰 `#d1d5db` | 极简专业 · 中性灰 |
| 🌙 **午夜** midnight | 靛蓝 `#4f46e5` / 淡靛 `#818cf8` | 静谧深邃 · 蓝紫系 |

默认启用**极光**；在 设置 → 通用 →「🎨 主题」点色块即可切换（会话内记忆，重启后回到默认）。

## ✨ 设计理念

DeepSeek 出厂配色是"蓝灰中性 + DeepSeek 蓝"。主题集把主色相扩展到 8 个色系，中性色随主题色相微调（如极光为带绿意的墨灰、樱花为暖紫褐），形成各具气质的对比：

- 每套主题的**层次关系一致**：`base < layer-1 < layer-2 < layer-3` 逐层抬升，深色模式品牌色提亮保证对比度；
- **语义色 8 套共用**：错误红、成功绿、警告琥珀的语义不因主题混淆；
- 全部 80 个 token 名与官方 `design-platform.css` 逐一对齐（脚本校验）。

---

## 📦 安装（在 DSH Web 会话里）

1. 在 DSH 会话中让 AI 执行 `cordis_define`：
   - `kind: "new"`，`idPrefix: "aurora"`
   - `code.client` ← **`client.js` 全文**（不需要 `code.host`）
2. 执行 `cordis_run` 激活，并在界面**批准授权**（仅浏览器半区）。
3. 页面立即变为极光配色；侧边栏 设置 → 通用 出现 **「🎨 主题」** 选择行（8 个色块），点击即切换。
4. 页面刷新后主题自动重新投递（对已运行包再次 `cordis_run` 即可取回）。

> 换其他机器 / 其他会话：同样的两步粘贴即可，插件是会话级的。

## 🗑 卸载 / 还原

- 临时还原出厂配色：设置 → 通用 → 关闭插件？不 —— 直接 `cordis_stop` 停用插件（或选回出厂默认后移除插件）。
- 彻底移除：`cordis_undefine`。
- 重启 Harness：动态插件消失，配色自动回到出厂（`$DSH_HOME/settings.yaml` 里持久化的内置偏好不受影响）。

---

## 🗃 持久化安装（重启不丢）

动态插件是会话内存，重启即失。要**永久生效**，走 DSH 正式插件机制（loader 树条目 + client bundle）。已备好 `persist/` 目录 —— 一个完整的 npm 包形态插件：

```
persist\
├── package.json        # name: dsh-aurora · exports["./client"] + ["./package.json"] · dsh.client · dsh.bundle
├── index.js            # Host 半区(空 apply — 条目必须在 Host 侧激活,client 图才包含它)
├── client.js           # 浏览器 bundle(__ModuleLoader__.load 协议,require('react'))
├── cordis.patch.yml    # bundle 补丁层:把条目 insert 进 loader 树
└── install.ps1         # ★ 一键安装脚本(本机已验证可用)
```

> ⚠️ **踩坑结论（本机实测）**：持久化条目的 `name` **必须用包名**（`dsh-aurora`），并且包必须**同时装入两处 node_modules**：
> 1. `D:\WORK_VSCODE\Vibe-coding\deepseekH\node_modules\dsh-aurora\` —— **client-modules 的解析基准**（它用 `require.resolve('<包名>/package.json')` 定位包的 `dsh.client` 声明与 `./client` bundle；相对路径永远解析不到，bundle 直接 404）
> 2. `C:\Users\46166\.dsh\profiles\web\node_modules\dsh-aurora\` —— **loader 的 ESM 解析基准**（host 条目从这里 import 包）
>
> 用 `install.ps1` 一键完成复制 + 补丁更新，不要手写这两步。

### 快速安装（推荐，已实测）

```powershell
powershell -ExecutionPolicy Bypass -File D:\WORK_VSCODE\Vibe-coding\DSHK\Plugin\plugins\dsh-aurora\persist\install.ps1
# 然后重启 harness(npm run dsh)并刷新页面
```

### 路线 A：官方 CLI（需要 pnpm）

```powershell
npm i -g pnpm
cd D:\WORK_VSCODE\Vibe-coding\deepseekH
# 最新 DSH 不分发全局 dsh launcher —— 从源码 checkout 根运行：
pnpm dsh plugin --profile web add file:D:\WORK_VSCODE\Vibe-coding\DSHK\Plugin\plugins\dsh-aurora\persist
# （本工作区经 npm 安装 @deepseek-ai/dsh 时也等价于：npx dsh plugin --profile web add <同上>）
```

`dsh plugin` 自动初始化 profile → pnpm 安装 → 检测到 `dsh.bundle` 声明，自动把包加入 `dsh.profile.bundles` 层栈。然后重启 `npm run dsh`。之后改了 `persist/client.js` 再 `dsh plugin --profile web update dsh-aurora` + 重启即可（`link:` 前缀 = 符号链接，迭代更快）。

### 路线 B：install.ps1 一键安装（免 pnpm，本机已验证）

```powershell
powershell -ExecutionPolicy Bypass -File D:\WORK_VSCODE\Vibe-coding\DSHK\Plugin\plugins\dsh-aurora\persist\install.ps1
```

脚本会完成三件事：① 包复制进 `D:\WORK_VSCODE\Vibe-coding\deepseekH\node_modules\dsh-aurora\`（client-modules 解析基准）；② 包复制进 `C:\Users\46166\.dsh\profiles\web\node_modules\dsh-aurora\`（loader 解析基准）；③ `cordis.patch.yml` 里维护 `name: dsh-aurora`（包名）条目。

3. **重启 `npm run dsh`（必须——web profile 的 HMR 默认禁用，补丁不热生效），然后刷新浏览器页面**。验证：启动后地址栏访问 `http://127.0.0.1:3080/plugins/dsh-aurora/client.js` 返回 200 即挂载成功；或终端里跑 `dsh --profile web --dump-config` 确认条目在树中。

> 说明：`dsh plugin --profile web --dump-config` 可离线查看组合后的树，确认条目已挂载；装完若执行过 `npm install`（会清理 node_modules），重跑 install.ps1 即可恢复。

### 卸载持久化版

- 路线 A：`dsh plugin --profile web remove dsh-aurora`（或直接改 patch 层）
- 路线 B：删掉 `cordis.patch.yml` 里的条目 + 删除 `profiles\web\dsh-aurora\` 目录
- 然后重启 `dsh`。

### ⚠️ 注意事项

- **持久化版与动态版（cordis_define）二选一**，别同时开（设置行 id `aurora-theme` 会撞）；
- 持久化版默认启用「极光」；设置 → 通用 →「🎨 主题」可切换 8 套，**当前选择为会话内记忆，重启后回到极光**；
- 浅色/深色/跟随系统的偏好仍由 `$DSH_HOME/settings.yaml`（`ui-theme.preference`）持久化，与主题互不影响；
- 主题机制详解见开发指南第 6 节，持久化机制详解见指南第 8.1 节。

---

## 🎨 Token 对照（以「极光」为例）

| Token | 浅色 | 深色 |
|---|---|---|
| `--dsw-alias-bg-base` | `rgb(249, 251, 250)` | `rgb(12, 18, 17)` |
| `--dsw-alias-bg-layer-1` | `rgb(255, 255, 255)` | `rgb(18, 27, 25)` |
| `--dsw-alias-bg-layer-2` | `rgb(252, 253, 252)` | `rgb(23, 33, 31)` |
| `--dsw-alias-bg-layer-3` | `rgb(247, 250, 249)` | `rgb(27, 39, 36)` |
| `--dsw-alias-brand-primary` | `rgb(13, 148, 136)` | `rgb(45, 212, 191)` |
| `--dsw-alias-brand-text` | `rgb(15, 118, 110)` | `rgb(204, 251, 241)` |
| `--dsw-alias-label-primary` | `rgb(24, 39, 37)` | `rgb(232, 247, 243)` |
| `--dsw-alias-label-secondary` | `rgb(71, 89, 86)` | `rgb(157, 180, 175)` |
| `--dsw-alias-button-primary-fill` | `rgb(13, 148, 136)` | `rgb(45, 212, 191)` |
| `--dsw-specific-sidebar-fill` | `rgb(244, 248, 247)` | `rgb(14, 22, 20)` |
| `--dsw-specific-bubble` | `rgb(231, 247, 244)` | `rgb(23, 40, 37)` |
| `--dsw-alias-state-error-primary` | `rgb(220, 38, 38)` | `rgb(248, 113, 113)` |
| `--dsw-alias-state-success-primary` | `rgb(22, 163, 74)` | `rgb(74, 222, 128)` |
| `--dsw-alias-state-warn-primary` | `rgb(245, 158, 11)` | `rgb(245, 158, 11)` |

完整 80 个 token 由 `client.js` 中的生成器（`THEME_DEFS` 12 参数 × 2 模式 → `buildTokens`）产出，全部为 `design-platform.css` 官方 token 名（`persist/verify8.mjs` 脚本校验：8 套 × 80 token × {light,dark} + 双版本一致性）；出厂默认值对照见 `@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css`。

---

## 🧪 技术要点（给想改主题的人）

- **为什么用 `overrideTokens` 而不是 `register`**：`register` 新增"可选主题 id"，但出厂外观设置里没有第三方主题入口，且单色板单值；`overrideTokens` 一套 `{light, dark}` 同时覆盖两种模式，与用户既有偏好无缝协作，卸载即还原 —— 这是动态主题包的推荐姿势。
- **token 必须成对**：传单值会抛教学错误（`"…is a bare string — pass { light, dark }"`）。
- **source 会被强制替换**为包 id（`<pluginId>.<packageId>`），且 disposer 自动挂在插件 fiber 上 —— 丢了返回值也会在卸载时还原。
- **选择行**：注册进 `settings.general.item` 插槽（`id: "aurora-theme"`、`order: 20`），8 个色块点击切换；当前主题为 apply 闭包状态（会话内记忆），通过 `inject` 面读写，组件只做展示。
- **预览**：不装插件也能看效果 —— 双击打开 `preview.html`（8 套主题切换预览）。

## 📂 文件

```
dsh-aurora\
├── client.js       # 插件本体(cordis_define -> code.client)
├── preview.html    # 静态配色预览(无需安装)
└── README.md       # 本文档
```
