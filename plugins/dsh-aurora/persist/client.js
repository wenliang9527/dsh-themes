// ============================================================
//  dsh-aurora — 极光主题集(8 套) · Client bundle(持久化版)
//  ============================================================
//  浏览器启动图协议:window.__ModuleLoader__.load({ id, factory })
//  - id 必须等于包名 "dsh-aurora"(与 loader 条目名一致,模块表键)
//  - factory(require) 惰性执行,返回模块导出;loader 取 exports.default ?? exports
//  - require 可解析平台种子字(staticModules):react 等,见
//    @deepseek-ai/dsh-client-web PLATFORM_MODULES
//  - 与动态版 client.js 的差异:React 来自 require('react') 而非闭包全局;
//    卸载清理显式返回(无动态门面的自动挂载)
//  - 8 套主题共用一套 token 生成器,与动态版 client.js 保持一致
// ============================================================

window.__ModuleLoader__.load({
  id: 'dsh-aurora',
  factory: (require) => {
    const React = require('react')

    // ---------- 颜色工具:原生 CSS color-mix,免 JS 混色 ----------
    // cm(base, amount, target) = target 按 amount% 叠加到 base 上(≈旧 mix(base,target,t))
    function cm(base, amount, target) {
      return 'color-mix(in oklch, ' + target + ' ' + amount + '%, ' + base + ')'
    }
    // cmAlpha(color, amount) = color 按 amount% 叠在透明上(≈旧 rgba 透明度)
    function cmAlpha(color, amount) {
      return 'color-mix(in srgb, ' + color + ' ' + amount + '%, transparent)'
    }
    const WHITE = '#ffffff'
    const BLACK = '#000000'

    // ---------- 8 套主题色板(每套 12 个核心参数 × 浅/深) ----------
    const SEMANTIC = {
      error:   { light: '#dc2626', dark: '#f87171' },
      error2:  { light: '#f87171', dark: '#f87171' },
      success: { light: '#16a34a', dark: '#4ade80' },
      success2:{ light: '#4ede7e', dark: '#86efac' },
      success3:{ light: '#e6faed', dark: '#0f2d1c' },
      warn:    { light: '#f59e0b', dark: '#f59e0b' },
      warn2:   { light: '#fbbf24', dark: '#fbbf24' },
      warn3:   { light: '#fef3c7', dark: '#402c08' },
      warnLabel:{ light: '#ca8a04', dark: '#f59e0b' },
    }

    const THEME_DEFS = {
      aurora: {
        name: '极光', chip: '#0d9488',
        light: { base: '#f9fbfa', l1: '#ffffff', l2: '#fcfdfc', l3: '#f7faf9', brand: '#0d9488', brand2: '#0f7670', text1: '#182725', text2: '#475956', text3: '#70827e', text4: '#94a39f', bubble: '#e7f7f4', bubbleHl: '#d1f0eb', sidebar: '#f4f8f7', navA: '#e6f5f2', navHl: '#eef6f4' },
        dark:  { base: '#0c1211', l1: '#121b19', l2: '#17211f', l3: '#1b2724', brand: '#2dd4bf', brand2: '#5eead4', text1: '#e8f7f3', text2: '#9db4af', text3: '#7c948f', text4: '#5e746f', bubble: '#172825', bubbleHl: '#112522', sidebar: '#0e1614', navA: '#16221f', navHl: '#131e1c' },
      },
      sakura: {
        name: '樱花', chip: '#db2777',
        light: { base: '#fdf9fb', l1: '#ffffff', l2: '#fefcfd', l3: '#faf3f7', brand: '#db2777', brand2: '#be185d', text1: '#3f2431', text2: '#6d4f5e', text3: '#9d7f8f', text4: '#c0a4b2', bubble: '#fdeef5', bubbleHl: '#f9d9ea', sidebar: '#fdf6f9', navA: '#fbe7f1', navHl: '#fdf0f6' },
        dark:  { base: '#1a1016', l1: '#241821', l2: '#2d1e28', l3: '#352430', brand: '#f472b6', brand2: '#f9a8d4', text1: '#fbeef5', text2: '#d4b3c3', text3: '#b28fa1', text4: '#8f6c7e', bubble: '#33202a', bubbleHl: '#2b1a23', sidebar: '#1d1218', navA: '#2b1b24', navHl: '#24161d' },
      },
      bamboo: {
        name: '竹影', chip: '#4d7c0f',
        light: { base: '#fafbf6', l1: '#ffffff', l2: '#fcfdf9', l3: '#f5f8ee', brand: '#4d7c0f', brand2: '#3f6212', text1: '#2b3624', text2: '#59664f', text3: '#84917a', text4: '#a7b49d', bubble: '#eff7e4', bubbleHl: '#e0f0cc', sidebar: '#f7f9f1', navA: '#eef5e2', navHl: '#f4f8ec' },
        dark:  { base: '#12160d', l1: '#1a2013', l2: '#212918', l3: '#28311e', brand: '#a3e635', brand2: '#bef264', text1: '#f0f7e6', text2: '#c0cdb2', text3: '#9aa88c', text4: '#77856a', bubble: '#232c18', bubbleHl: '#1d2513', sidebar: '#14190f', navA: '#202a15', navHl: '#1a2111' },
      },
      violet: {
        name: '紫罗兰', chip: '#7c3aed',
        light: { base: '#faf9fd', l1: '#ffffff', l2: '#fcfbfe', l3: '#f4f1fa', brand: '#7c3aed', brand2: '#6d28d9', text1: '#2e2440', text2: '#5d5276', text3: '#8c81a5', text4: '#b0a7c4', bubble: '#f2edfd', bubbleHl: '#e6dcfb', sidebar: '#f8f6fc', navA: '#efe8fb', navHl: '#f5f1fc' },
        dark:  { base: '#140f1e', l1: '#1d152b', l2: '#251a36', l3: '#2c1f40', brand: '#a78bfa', brand2: '#c4b5fd', text1: '#f0ebfa', text2: '#c9bfdd', text3: '#a596be', text4: '#82739d', bubble: '#2a1f3d', bubbleHl: '#241a35', sidebar: '#171020', navA: '#241a34', navHl: '#1e152c' },
      },
      amber: {
        name: '琥珀', chip: '#d97706',
        light: { base: '#fdf9f4', l1: '#ffffff', l2: '#fefbf7', l3: '#f9f2e8', brand: '#d97706', brand2: '#b45309', text1: '#40342a', text2: '#6d5d4f', text3: '#9c8b7a', text4: '#bfb09f', bubble: '#fdefd9', bubbleHl: '#fbe3b8', sidebar: '#fcf6ee', navA: '#faecd7', navHl: '#fdf4e7' },
        dark:  { base: '#171310', l1: '#201a15', l2: '#282117', l3: '#302818', brand: '#fbbf24', brand2: '#fcd34d', text1: '#faf3e8', text2: '#d6c3ab', text3: '#b19c83', text4: '#8c7860', bubble: '#33291a', bubbleHl: '#2b2315', sidebar: '#1a1511', navA: '#2b2216', navHl: '#231c13' },
      },
      abyss: {
        name: '深海', chip: '#1d4ed8',
        light: { base: '#f4f8fc', l1: '#ffffff', l2: '#f9fbfe', l3: '#edf3fa', brand: '#1d4ed8', brand2: '#1e40af', text1: '#1e2a3a', text2: '#4d5d73', text3: '#8191a8', text4: '#a7b5c9', bubble: '#e3eefb', bubbleHl: '#cfe0f7', sidebar: '#f0f6fb', navA: '#e2ecf9', navHl: '#eaf2fa' },
        dark:  { base: '#0b1220', l1: '#111a2c', l2: '#16213a', l3: '#1b2846', brand: '#60a5fa', brand2: '#93c5fd', text1: '#e6eefb', text2: '#b6c4da', text3: '#8fa0ba', text4: '#6b7c96', bubble: '#182742', bubbleHl: '#132138', sidebar: '#0d1525', navA: '#172642', navHl: '#121d31' },
      },
      graphite: {
        name: '石墨', chip: '#374151',
        light: { base: '#fafafa', l1: '#ffffff', l2: '#fdfdfd', l3: '#f3f3f3', brand: '#111827', brand2: '#1f2937', text1: '#1f2937', text2: '#4b5563', text3: '#6b7280', text4: '#9ca3af', bubble: '#f1f3f5', bubbleHl: '#e5e9ec', sidebar: '#f5f5f5', navA: '#ebedf0', navHl: '#f2f3f5' },
        dark:  { base: '#111113', l1: '#18181b', l2: '#1e1e22', l3: '#242429', brand: '#d1d5db', brand2: '#f3f4f6', text1: '#eceef1', text2: '#b6bcc4', text3: '#8e959e', text4: '#6a7078', bubble: '#232327', bubbleHl: '#1d1d21', sidebar: '#141416', navA: '#1f1f23', navHl: '#1a1a1e' },
      },
      midnight: {
        name: '午夜', chip: '#4f46e5',
        light: { base: '#f7f8fd', l1: '#ffffff', l2: '#fafbfe', l3: '#eff1fb', brand: '#4f46e5', brand2: '#4338ca', text1: '#222442', text2: '#52557a', text3: '#8386ab', text4: '#aaadd0', bubble: '#e8e9fb', bubbleHl: '#d6d8f8', sidebar: '#f1f2fa', navA: '#e3e4f8', navHl: '#ececf9' },
        dark:  { base: '#0d0e1a', l1: '#141527', l2: '#191b31', l3: '#1f213c', brand: '#818cf8', brand2: '#a5b4fc', text1: '#eaebf9', text2: '#b9bcdc', text3: '#9296bd', text4: '#6e7299', bubble: '#1f2140', bubbleHl: '#191b35', sidebar: '#101122', navA: '#1c1e39', navHl: '#161830' },
      },
    }

    // ---------- Token 生成器:12 个核心参数 → 80 个语义 token ----------
    function buildTokens(scheme, p) {
      const dark = scheme === 'dark'
      const fg = dark ? cm(p.text1, 80, BLACK) : WHITE            // 品牌/深底上的前景文字
      const brandText = dark ? cm(p.brand, 70, WHITE) : p.brand2  // 品牌文字
      const borderBase = dark ? WHITE : p.text1                   // 边框/交互用色基
      const interactive = dark ? WHITE : p.brand                  // 交互反馈色

      return {
        '--dsw-alias-bg-base': p.base,
        '--dsw-alias-bg-layer-1': p.l1,
        '--dsw-alias-bg-layer-2': p.l2,
        '--dsw-alias-bg-layer-3': p.l3,
        '--dsw-alias-bg-overlay': dark ? cm(p.l3, 5, WHITE) : p.l1,
        '--dsw-alias-bg-module-platform': dark ? cm(p.l3, 50, p.l2) : cm(p.base, 40, p.l1),
        '--dsw-alias-bg-multi-select': cm(p.l2, 50, p.l3),
        '--dsw-alias-bg-skeleton': cmAlpha(borderBase, dark ? 8 : 5),
        '--dsw-alias-border-l1': cmAlpha(borderBase, 6),
        '--dsw-alias-border-l2': cmAlpha(borderBase, 12),
        '--dsw-alias-border-l2-darkmode-thin': cmAlpha(borderBase, dark ? 7 : 10),
        '--dsw-alias-border-l3': cmAlpha(borderBase, 15),
        '--dsw-alias-border-l4': cmAlpha(borderBase, 20),
        '--dsw-alias-border-inverted': dark ? cmAlpha(p.brand, 35) : cmAlpha(p.brand, 0),
        '--dsw-alias-border-inverted2': dark ? cmAlpha(p.brand, 45) : cmAlpha(p.brand, 0),
        '--dsw-alias-brand-primary': p.brand,
        '--dsw-alias-brand-text': brandText,
        '--dsw-alias-brand-primary-invert': dark ? brandText : WHITE,
        '--dsw-alias-brand-primary-new-colorprimary-new-color': dark ? p.brand : cm(p.brand, 20, WHITE),
        '--dsw-alias-button-primary-fill': p.brand,
        '--dsw-alias-button-primary-hover': dark ? brandText : p.brand2,
        '--dsw-alias-button-primary-dimmed': cm(p.brand, 85, p.base),
        '--dsw-alias-button-info-fill': dark ? p.brand : cm(p.brand, 20, WHITE),
        '--dsw-alias-button-info-hover': dark ? p.brand2 : p.brand,
        '--dsw-alias-button-contrast-fill': dark ? cm(p.text1, 15, WHITE) : cm(p.text1, 20, BLACK),
        '--dsw-alias-button-elevated-fill': p.l1,
        '--dsw-alias-button-floating-fill': p.l1,
        '--dsw-alias-button-floating-hover': cm(p.l2, 50, p.l3),
        '--dsw-alias-button-ghost-active-border': dark ? cm(p.brand, 30, WHITE) : cm(p.brand, 60, p.text1),
        '--dsw-alias-button-ghost-active-fill': cm(p.base, 4, p.brand),
        '--dsw-alias-button-ghost-active-hover': cm(p.base, 7, p.brand),
        '--dsw-alias-interactive-bg-hover': cmAlpha(interactive, dark ? 8 : 6),
        '--dsw-alias-interactive-bg-active': cmAlpha(interactive, dark ? 14 : 10),
        '--dsw-alias-interactive-bg-hover-solid': cm(p.base, 3, p.brand),
        '--dsw-alias-interactive-bg-hover-accent': cmAlpha(p.brand, dark ? 22 : 12),
        '--dsw-alias-interactive-bg-hover-danger': cmAlpha(SEMANTIC.error[scheme], dark ? 15 : 5),
        '--dsw-alias-label-primary': p.text1,
        '--dsw-alias-label-secondary': p.text2,
        '--dsw-alias-label-tertiary': p.text3,
        '--dsw-alias-label-caption': p.text4,
        '--dsw-alias-label-dimmed': cm(p.text1, 78, p.base),
        '--dsw-alias-label-primary-foreground': fg,
        '--dsw-alias-label-primary-inverted': fg,
        '--dsw-alias-label-primary-dimmed': p.text1,
        '--dsw-alias-label-primary-bluish': dark ? p.text1 : p.brand2,
        '--dsw-alias-state-error-primary': SEMANTIC.error[scheme],
        '--dsw-alias-state-error-secondary': SEMANTIC.error2[scheme],
        '--dsw-alias-state-success-primary': SEMANTIC.success[scheme],
        '--dsw-alias-state-success-secondary': SEMANTIC.success2[scheme],
        '--dsw-alias-state-success-tertiary': SEMANTIC.success3[scheme],
        '--dsw-alias-state-warn-label': SEMANTIC.warnLabel[scheme],
        '--dsw-alias-state-warn-primary': SEMANTIC.warn[scheme],
        '--dsw-alias-state-warn-secondary': SEMANTIC.warn2[scheme],
        '--dsw-alias-state-warn-tertiary': SEMANTIC.warn3[scheme],
        '--dsw-alias-state-business-primary': p.brand,
        '--dsw-alias-state-business-tertiary': cm(p.brand, 90, p.base),
        '--dsw-alias-markdown-code-block': cm(p.base, dark ? 3 : 4, p.text1),
        '--dsw-alias-markdown-code-block-banner': cm(p.base, dark ? 6 : 5, p.text1),
        '--dsw-alias-markdown-inline-code': cm(p.l1, dark ? 8 : 6, p.brand),
        '--dsw-alias-markdown-citation': cm(p.base, 3, p.brand),
        '--dsw-alias-markdown-tag': cm(p.base, 3, p.brand),
        '--dsw-alias-markdown-placeholder': cm(p.base, 2, p.text1),
        '--dsw-alias-markdown-code-segment-selected': p.l1,
        '--dsw-alias-markdown-code-segment-unselected': cm(p.base, dark ? 3 : 4, p.text1),
        '--dsw-alias-scrollbar-bg-l1': cm(p.text1, 85, p.base),
        '--dsw-alias-scrollbar-bg-l2': cm(p.text1, 78, p.base),
        '--dsw-alias-scrollbar-hover-l1': cm(p.text1, 72, p.base),
        '--dsw-alias-scrollbar-hover-l2': cm(p.text1, 65, p.base),
        '--dsw-alias-toast-bg': dark ? cm(p.l3, 15, p.text1) : cm(p.text1, 15, BLACK),
        '--dsw-alias-tooltip-bg': dark ? cm(p.l3, 15, p.text1) : cm(p.text1, 15, BLACK),
        '--dsw-specific-bubble': p.bubble,
        '--dsw-specific-bubble-highlight': p.bubbleHl,
        '--dsw-specific-sidebar-fill': p.sidebar,
        '--dsw-specific-sidebar-nav-item-active': p.navA,
        '--dsw-specific-sidebar-nav-item-active-accent': cm(p.brand, 30, p.navA),
        '--dsw-specific-sidebar-nav-item-hover': p.navHl,
        '--dsw-specific-input-major': p.l1,
        '--dsw-specific-login-input': cm(p.base, 50, p.l1),
        '--dsw-specific-selector': cm(p.l2, 50, p.l3),
        '--dsw-specific-tip': cm(p.base, 2, p.brand),
      }
    }

    // overrideTokens 要求扁平表:每个 token 一个 { light, dark } 值对(不是按明暗分两张表)
    function buildPairMap(lightDef, darkDef) {
      const lt = buildTokens('light', lightDef)
      const dk = buildTokens('dark', darkDef)
      const out = {}
      for (const k of Object.keys(lt)) out[k] = { light: lt[k], dark: dk[k] }
      return out
    }

    // 组装 8 套主题
    const THEMES = {}
    for (const [id, def] of Object.entries(THEME_DEFS)) {
      THEMES[id] = {
        id,
        name: def.name,
        chip: def.chip,
        tokens: buildPairMap(def.light, def.dark),
      }
    }

    // ---------- 偏好持久化:localStorage(带版本 key + 校验回退) ----------
    // 第三方插件没有 Host 设置命名空间,社区标准做法是浏览器存储:
    // key 带版本号,读回时校验(未知 id 回退默认),坏数据/隐私模式静默降级。
    const STORAGE_KEY = 'dsh-aurora/settings/v1'
    function loadSavedTheme() {
      try {
        const raw = globalThis.localStorage && globalThis.localStorage.getItem(STORAGE_KEY)
        if (raw && THEMES[raw]) return raw
      } catch (e) { /* 隐私模式等场景忽略 */ }
      return 'aurora'
    }
    function saveTheme(id) {
      try {
        if (globalThis.localStorage) globalThis.localStorage.setItem(STORAGE_KEY, id)
      } catch (e) { /* 写失败不阻断切换 */ }
    }

    return {
      apply(ctx) {
        const theme = ctx.get('theme')
        if (theme === undefined) return

        const disposers = []

        // —— 激活即应用主题(上次选择或默认;静态插件:显式收集 disposer,卸载时统一还原) ——
        let current = loadSavedTheme()
        let disposeLayer = theme.overrideTokens('dsh-aurora', THEMES[current].tokens)
        disposers.push(() => { if (disposeLayer !== null) { disposeLayer(); disposeLayer = null } })

        // 切换主题:移除旧调色层 → 叠加新层 → 记入本地存储
        const setTheme = (id) => {
          if (id === current || !THEMES[id]) return
          if (disposeLayer !== null) { disposeLayer(); disposeLayer = null }
          disposeLayer = theme.overrideTokens('dsh-aurora', THEMES[id].tokens)
          current = id
          saveTheme(id)
        }

        // —— 设置 → 通用 →「主题」选择行(8 色块) ——
        const slots = ctx.get('slots')
        if (slots === undefined) return

        const ThemeRow = (props) => {
          const [active, setActive] = React.useState(props.getCurrent())
          const chips = []
          for (const t of Object.values(THEMES)) {
            chips.push(React.createElement('button', {
              key: t.id,
              type: 'button',
              title: t.name,
              'aria-pressed': active === t.id,
              onClick: () => { props.setTheme(t.id); setActive(t.id) },
              style: {
                width: 26, height: 26, borderRadius: 8, padding: 0, cursor: 'pointer',
                background: t.chip,
                border: active === t.id ? '2px solid var(--dsw-alias-label-primary)' : '1px solid var(--dsw-alias-border-l2)',
                boxShadow: active === t.id ? '0 0 0 2px var(--dsw-alias-bg-layer-1)' : 'none',
              },
            }))
          }
          return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', flexWrap: 'wrap' } },
            React.createElement('span', { style: { fontSize: 14, color: 'var(--dsw-alias-label-primary)' } }, '🎨 主题'),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } }, ...chips),
            React.createElement('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' } },
              (THEMES[active] ? THEMES[active].name : active) + ' · 8 套主题 · 跟随你的浅色/深色偏好'),
          )
        }

        disposers.push(slots.inject('settings.general.item', () => slots.register(
          {
            name: 'settings.general.item',
            id: 'aurora-theme',
            order: 20,
            inject: () => ({
              setTheme,
              getCurrent: () => current,
            }),
          },
          (props) => React.createElement(ThemeRow, props),
        )))

        // 卸载时统一清理(主题调色层 + 设置行)
        return () => {
          for (const d of disposers) if (typeof d === 'function') d()
        }
      },
    }
  },
})
