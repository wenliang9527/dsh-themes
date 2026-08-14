# 🎨 dsh-themes — DeepSeek Harness 主题集

DeepSeek Harness (DSH) Web GUI 的 **8 套主题** + **插件开发指南**。

> 8 套主题（每套含浅色/深色双形态）：🌀 极光 · 🌸 樱花 · 🎋 竹影 · 🟣 紫罗兰 · 🔶 琥珀 · 🌊 深海 · ⬛ 石墨 · 🌙 午夜

## 📚 内容

| 路径 | 说明 |
|---|---|
| [docs/DSH-PLUGIN-DEV-GUIDE.md](docs/DSH-PLUGIN-DEV-GUIDE.md) | **DSH 插件开发指南**（基于 `@deepseek-ai/*` 第一手源码研究：双半区模型、cordis 五动词、插槽目录、动态工具契约、主题机制、持久化机制与踩坑实录） |
| [plugins/dsh-aurora/](plugins/dsh-aurora/) | **🎨 主题集插件**（8 套主题；`client.js` 可直接粘贴到 `cordis_define`，`preview.html` 静态预览，`persist/` 持久化安装包） |

## 🚀 快速使用

**会话内安装（动态插件）**：

1. 让 AI 执行 `cordis_define`：`kind: "new"`、`idPrefix: "aurora"`、`code.client` ← `plugins/dsh-aurora/client.js` 全文。
2. `cordis_run` 激活并批准授权 —— 页面立即变为极光配色。
3. 设置 → 通用 →「🎨 主题」选择行：8 个色块点击切换。

**持久化安装（重启不丢）**：

```powershell
powershell -ExecutionPolicy Bypass -File plugins\dsh-aurora\persist\install.ps1
# 然后重启 dsh 并刷新页面
```

> 安装/卸载/迁移细节见 `plugins/dsh-aurora/README.md`；`npm install` 清掉 node_modules 后重跑 install.ps1 即可恢复。

## 🎨 8 套主题

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

每套主题由 12 个核心色板参数经生成器产出 **80 个 `--dsw-*` 语义 token**（浅色/深色各一套值，跟随系统偏好）；语义色（错误/成功/警告）8 套共用，保证语义不混淆。

## 📁 结构

```
dsh-themes\
├── README.md                    # 本文档
├── docs\
│   └── DSH-PLUGIN-DEV-GUIDE.md  # 插件开发指南
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
            ├── install.ps1      #     一键安装脚本
            └── verify.mjs / verify8.mjs  # 契约自检脚本
```

## 开发新插件

先读 [开发指南](docs/DSH-PLUGIN-DEV-GUIDE.md) 第 3 节（十分钟上手）与第 9 节（踩坑清单），参考 [dsh-workspace](https://github.com/wenliang9527/dsh-workspace) 中 `plugins/one-click-launcher/plugin/host.js`、`client.js` 的成品写法。

## 相关仓库

- [dsh-workspace](https://github.com/wenliang9527/dsh-workspace) — DSH 插件开发工作区
- [dsh-one-click-launcher](https://github.com/wenliang9527/dsh-one-click-launcher) — ⚡ 一键启动器插件
- [dsh-eye](https://github.com/wenliang9527/dsh-eye) — 👁 eye 插件
- [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — DeepSeek Harness 主仓
