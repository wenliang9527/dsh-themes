<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek%20Harness-0.1.0--rc.6-3167E3?style=flat-square" alt="DSH">
  <img src="https://img.shields.io/badge/license-MIT-3167E3?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/ecosystem-dsh--plugin-2ea44f?style=flat-square" alt="dsh-plugin">
  <img src="https://img.shields.io/github/stars/wenliang9527/dsh-themes?style=flat-square" alt="stars">
</p>

# 🎨 dsh-themes

> **DeepSeek Harness Web GUI 主题集** —— 8 套手调主题（每套含浅色/深色双形态），外加一份基于 `@deepseek-ai/*` 第一手源码研究的 **DSH 插件开发指南**。

<p align="center">
  🌀 极光 · 🌸 樱花 · 🎋 竹影 · 🟣 紫罗兰 · 🔶 琥珀 · 🌊 深海 · ⬛ 石墨 · 🌙 午夜
</p>

## ✨ 特性

| | |
|---|---|
| 🎨 **8 套主题 × 双形态** | 每套 12 个核心色板参数经生成器产出 **80 个 `--dsw-*` 语义 token**（浅色/深色各一套值，跟随系统偏好） |
| 🧮 **原生 CSS `color-mix()`** | 层级/边框/文字/交互等派生色由浏览器实时混色，零 JS 混色工具链 |
| 💾 **选择持久化** | 主题选择写入浏览器本地存储（`dsh-aurora/settings/v1`），刷新/重启后自动恢复上次的选择 |
| 🏷️ **语义色统一** | 错误/成功/警告 8 套共享，语义清晰不混淆 |
| ⚡ **双形态安装** | 会话级动态插件（`cordis_define`）或持久化正式插件（`install.ps1`） |
| 📖 **完整开发指南** | 双半区模型 / cordis 五动词 / 插槽系统 / 主题机制 / 持久化 / 社区案例拆解 |

## 🚀 快速使用

### 会话内安装（动态插件）

1. 让 AI 执行 `cordis_define`：`kind: "new"`、`idPrefix: "aurora"`、`code.client` ← `plugins/dsh-aurora/client.js` 全文
2. `cordis_run` 激活并批准授权 —— 页面立即变为极光配色
3. 设置 → 通用 →「🎨 主题」行：8 个色块点击切换，选择自动记住

### 持久化安装（重启不丢）

```powershell
powershell -ExecutionPolicy Bypass -File plugins\dsh-aurora\persist\install.ps1
# 然后重启 dsh（npm run dsh）并硬刷新浏览器
```

> 安装/卸载/迁移细节见 [`plugins/dsh-aurora/README.md`](plugins/dsh-aurora/README.md)；`npm install` 清掉 node_modules 后重跑 `install.ps1` 即可恢复。静态预览：双击打开 `plugins/dsh-aurora/preview.html`。

## 🎨 主题一览

| 主题 | 色板（浅色主色 / 深色主色） | 气质 |
|---|---|---|
| 🌀 **极光** aurora | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%230d9488'/><rect x='12' width='9' height='18' rx='4' fill='%232dd4bf'/></svg>" width="22" height="18" alt=""> `#0d9488` / `#2dd4bf` | 冷静通透 · 深海质感 |
| 🌸 **樱花** sakura | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%23db2777'/><rect x='12' width='9' height='18' rx='4' fill='%23f472b6'/></svg>" width="22" height="18" alt=""> `#db2777` / `#f472b6` | 温柔甜美 · 粉调 |
| 🎋 **竹影** bamboo | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%234d7c0f'/><rect x='12' width='9' height='18' rx='4' fill='%23a3e635'/></svg>" width="22" height="18" alt=""> `#4d7c0f` / `#a3e635` | 清雅自然 · 抹茶系 |
| 🟣 **紫罗兰** violet | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%237c3aed'/><rect x='12' width='9' height='18' rx='4' fill='%23a78bfa'/></svg>" width="22" height="18" alt=""> `#7c3aed` / `#a78bfa` | 神秘优雅 · 紫色系 |
| 🔶 **琥珀** amber | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%23d97706'/><rect x='12' width='9' height='18' rx='4' fill='%23fbbf24'/></svg>" width="22" height="18" alt=""> `#d97706` / `#fbbf24` | 温暖醇厚 · 秋日系 |
| 🌊 **深海** abyss | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%231d4ed8'/><rect x='12' width='9' height='18' rx='4' fill='%2360a5fa'/></svg>" width="22" height="18" alt=""> `#1d4ed8` / `#60a5fa` | 冷静专业 · 蓝色系 |
| ⬛ **石墨** graphite | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%23111827'/><rect x='12' width='9' height='18' rx='4' fill='%23d1d5db'/></svg>" width="22" height="18" alt=""> `#111827` / `#d1d5db` | 极简专业 · 中性灰 |
| 🌙 **午夜** midnight | <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='18'><rect x='0' width='9' height='18' rx='4' fill='%234f46e5'/><rect x='12' width='9' height='18' rx='4' fill='%23818cf8'/></svg>" width="22" height="18" alt=""> `#4f46e5` / `#818cf8` | 静谧深邃 · 蓝紫系 |

## 💾 持久化原理

- **内置偏好**（light/dark/system）由 Harness 存于 `$DSH_HOME/settings.yaml`（跨浏览器同步）。
- **第三方主题选择**没有 Host 设置命名空间可用：插件选择写入**浏览器本地存储**（带版本号 key `dsh-aurora/settings/v1`，读回校验、坏数据回退默认）——跨重启/跨刷新保留，但只对当前浏览器与 origin 生效。
- 想升级为"落盘 `settings.yaml` + 跨浏览器同步"？开发指南 §8.4 提供 **Host 设置缝 + 私有 HTTP 路由** 的完整方案（参考 dsh-theme-palettes 案例）。

## 📁 仓库结构

```
dsh-themes\
├── README.md                    # 本文档
├── docs\
│   └── DSH-PLUGIN-DEV-GUIDE.md  # 插件开发指南（800+ 行，含社区案例拆解）
└── plugins\
    └── dsh-aurora\              # 主题集插件
        ├── client.js            #   动态版（cordis_define -> code.client）
        ├── README.md            #   设计说明 + 安装/卸载 + token 对照
        ├── preview.html         #   8 套主题静态预览（双击打开）
        └── persist\             #   持久化安装包
            ├── package.json     #     npm 包形态（dsh.client / dsh.bundle）
            ├── index.js         #     Host 半区（空 apply）
            ├── client.js        #     浏览器 bundle（__ModuleLoader__.load 协议）
            ├── cordis.patch.yml #     bundle 补丁层
            ├── install.ps1      #     一键安装脚本（含 patch 去重）
            └── verify.mjs / verify8.mjs  # 契约自检（token 合法性 + 8 主题切换 + 持久化行为）
```

## 📖 开发指南

[`docs/DSH-PLUGIN-DEV-GUIDE.md`](docs/DSH-PLUGIN-DEV-GUIDE.md) —— 基于 `@deepseek-ai/*` 发布包第一手源码研究的 DSH 插件开发手册，核心章节：

| 章节 | 内容 |
|---|---|
| §3 十分钟快速上手 | 最小 Host / Client 半区 + 安装循环 |
| §5 Client 半区 | 闭包环境 · ctx 门面 · 插槽系统 · 设置行范式 |
| §6 主题插件专项 | Token 三层体系 · ThemeRuntime · `register` vs `overrideTokens` · 偏好持久化 |
| §7 调试与故障排查 | `cordis_inspect` · 常见错误速查表（含 overrideTokens 形状坑） |
| §8 发布与分发 | 正式插件形态 · 安装方式权威矩阵 · **§8.3 dsh-theme 案例**（localStorage + `settings.section` + 6 根色模型） · **§8.4 dsh-theme-palettes 案例**（Host 设置缝持久化 + 三家配色风格对比） |
| §9 最佳实践 | Host / Client 半区踩坑清单 |

## 🔗 相关仓库

- [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — DeepSeek Harness 主仓
- [dsh-workspace](https://github.com/wenliang9527/dsh-workspace) — DSH 插件开发工作区
- [dsh-one-click-launcher](https://github.com/wenliang9527/dsh-one-click-launcher) — ⚡ 一键启动器插件
- [dsh-eye](https://github.com/wenliang9527/dsh-eye) — 👁 eye 插件

---

*本仓库通过 GitHub `dsh-plugin` topic 加入 DSH 社区插件生态；主题插件为独立社区项目，与 DeepSeek 无隶属或背书关系。*
