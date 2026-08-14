// ============================================================
//  dsh-aurora — 极光主题集(8 套) · Client half
//  ============================================================
//  把本文件全文粘贴到 cordis_define -> code.client(本主题不需要 host 半区)
//  设计说明、安装步骤、8 套色板对照见同目录 README.md
//  ============================================================
//  机制说明:
//  - 主题 = 覆盖 --dsw-alias-* / --dsw-specific-* 语义 token(见
//    @deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css)
//  - 通过 theme.overrideTokens(source, tokens) 叠加调色层:每个 token 必须
//    同时提供 { light, dark } 两个值,跟随用户"浅色/深色/跟随系统"偏好自动切换
//  - 动态包门面会把 source 强制替换为包 id,并把清理 disposer 自动挂到插件
//    fiber 上:停用/卸载插件时调色层自动还原,不需要手动清理
//  - 8 套主题共用一套 token 生成器(每套 12 个核心色板参数 → 80 个 token),
//    保证各套内部的层次/对比关系一致
// ============================================================

// ---------- 颜色工具 ----------
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgb(c) { return 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')' }
function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)] }
function alpha(c, a) { return 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + a + ')' }
const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]

// ---------- 8 套主题色板(每套 12 个核心参数 × 浅/深) ----------
// 语义色(错误/成功/警告)8 套共用,保证语义不混淆
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
  const b = hexToRgb(p.base), l1 = hexToRgb(p.l1), l2 = hexToRgb(p.l2), l3 = hexToRgb(p.l3)
  const brand = hexToRgb(p.brand), brand2 = hexToRgb(p.brand2)
  const t1 = hexToRgb(p.text1), t2 = hexToRgb(p.text2), t3 = hexToRgb(p.text3), t4 = hexToRgb(p.text4)
  const bubble = hexToRgb(p.bubble), bubbleHl = hexToRgb(p.bubbleHl)
  const sidebar = hexToRgb(p.sidebar), navA = hexToRgb(p.navA), navHl = hexToRgb(p.navHl)
  const err = hexToRgb(SEMANTIC.error[scheme]), err2 = hexToRgb(SEMANTIC.error2[scheme])
  const ok = hexToRgb(SEMANTIC.success[scheme]), ok2 = hexToRgb(SEMANTIC.success2[scheme]), ok3 = hexToRgb(SEMANTIC.success3[scheme])
  const wa = hexToRgb(SEMANTIC.warn[scheme]), wa2 = hexToRgb(SEMANTIC.warn2[scheme]), wa3 = hexToRgb(SEMANTIC.warn3[scheme]), waL = hexToRgb(SEMANTIC.warnLabel[scheme])
  const fg = dark ? mix(t1, BLACK, 0.8) : WHITE            // 品牌/深底上的前景文字
  const brandText = dark ? mix(brand, WHITE, 0.7) : brand2 // 品牌文字
  const borderBase = dark ? WHITE : t1                      // 边框/交互用色基
  const interactive = dark ? WHITE : brand                  // 交互反馈色

  return {
    // 表面层级
    '--dsw-alias-bg-base': rgb(b),
    '--dsw-alias-bg-layer-1': rgb(l1),
    '--dsw-alias-bg-layer-2': rgb(l2),
    '--dsw-alias-bg-layer-3': rgb(l3),
    '--dsw-alias-bg-overlay': dark ? rgb(mix(l3, WHITE, 0.05)) : rgb(l1),
    '--dsw-alias-bg-module-platform': dark ? rgb(mix(l3, l2, 0.5)) : rgb(mix(b, l1, 0.4)),
    '--dsw-alias-bg-multi-select': rgb(mix(l2, l3, 0.5)),
    '--dsw-alias-bg-skeleton': alpha(borderBase, dark ? 0.08 : 0.05),
    // 边框
    '--dsw-alias-border-l1': alpha(borderBase, 0.06),
    '--dsw-alias-border-l2': alpha(borderBase, 0.12),
    '--dsw-alias-border-l2-darkmode-thin': alpha(borderBase, dark ? 0.07 : 0.1),
    '--dsw-alias-border-l3': alpha(borderBase, 0.15),
    '--dsw-alias-border-l4': alpha(borderBase, 0.2),
    '--dsw-alias-border-inverted': dark ? alpha(brand, 0.35) : alpha(brand, 0),
    '--dsw-alias-border-inverted2': dark ? alpha(brand, 0.45) : alpha(brand, 0),
    // 品牌与按钮
    '--dsw-alias-brand-primary': rgb(brand),
    '--dsw-alias-brand-text': rgb(brandText),
    '--dsw-alias-brand-primary-invert': dark ? rgb(brandText) : rgb(WHITE),
    '--dsw-alias-brand-primary-new-colorprimary-new-color': dark ? rgb(brand) : rgb(mix(brand, WHITE, 0.2)),
    '--dsw-alias-button-primary-fill': rgb(brand),
    '--dsw-alias-button-primary-hover': dark ? rgb(brandText) : rgb(brand2),
    '--dsw-alias-button-primary-dimmed': rgb(mix(brand, b, 0.85)),
    '--dsw-alias-button-info-fill': dark ? rgb(brand) : rgb(mix(brand, WHITE, 0.2)),
    '--dsw-alias-button-info-hover': dark ? rgb(brand2) : rgb(brand),
    '--dsw-alias-button-contrast-fill': dark ? rgb(mix(t1, WHITE, 0.15)) : rgb(mix(t1, BLACK, 0.2)),
    '--dsw-alias-button-elevated-fill': rgb(l1),
    '--dsw-alias-button-floating-fill': rgb(l1),
    '--dsw-alias-button-floating-hover': rgb(mix(l2, l3, 0.5)),
    '--dsw-alias-button-ghost-active-border': dark ? rgb(mix(brand, WHITE, 0.3)) : rgb(mix(brand, t1, 0.6)),
    '--dsw-alias-button-ghost-active-fill': rgb(mix(b, brand, 0.04)),
    '--dsw-alias-button-ghost-active-hover': rgb(mix(b, brand, 0.07)),
    // 交互反馈
    '--dsw-alias-interactive-bg-hover': alpha(interactive, dark ? 0.08 : 0.06),
    '--dsw-alias-interactive-bg-active': alpha(interactive, dark ? 0.14 : 0.1),
    '--dsw-alias-interactive-bg-hover-solid': rgb(mix(b, brand, 0.03)),
    '--dsw-alias-interactive-bg-hover-accent': alpha(brand, dark ? 0.22 : 0.12),
    '--dsw-alias-interactive-bg-hover-danger': alpha(err, dark ? 0.15 : 0.05),
    // 文字
    '--dsw-alias-label-primary': rgb(t1),
    '--dsw-alias-label-secondary': rgb(t2),
    '--dsw-alias-label-tertiary': rgb(t3),
    '--dsw-alias-label-caption': rgb(t4),
    '--dsw-alias-label-dimmed': rgb(mix(t1, b, 0.78)),
    '--dsw-alias-label-primary-foreground': rgb(fg),
    '--dsw-alias-label-primary-inverted': rgb(fg),
    '--dsw-alias-label-primary-dimmed': rgb(t1),
    '--dsw-alias-label-primary-bluish': dark ? rgb(t1) : rgb(brand2),
    // 状态色(8 套共用语义)
    '--dsw-alias-state-error-primary': rgb(err),
    '--dsw-alias-state-error-secondary': rgb(err2),
    '--dsw-alias-state-success-primary': rgb(ok),
    '--dsw-alias-state-success-secondary': rgb(ok2),
    '--dsw-alias-state-success-tertiary': rgb(ok3),
    '--dsw-alias-state-warn-label': rgb(waL),
    '--dsw-alias-state-warn-primary': rgb(wa),
    '--dsw-alias-state-warn-secondary': rgb(wa2),
    '--dsw-alias-state-warn-tertiary': rgb(wa3),
    '--dsw-alias-state-business-primary': rgb(brand),
    '--dsw-alias-state-business-tertiary': rgb(mix(brand, b, 0.9)),
    // Markdown / 代码
    '--dsw-alias-markdown-code-block': rgb(mix(b, t1, dark ? 0.03 : 0.04)),
    '--dsw-alias-markdown-code-block-banner': rgb(mix(b, t1, dark ? 0.06 : 0.05)),
    '--dsw-alias-markdown-inline-code': rgb(mix(l1, brand, dark ? 0.08 : 0.06)),
    '--dsw-alias-markdown-citation': rgb(mix(b, brand, 0.03)),
    '--dsw-alias-markdown-tag': rgb(mix(b, brand, 0.03)),
    '--dsw-alias-markdown-placeholder': rgb(mix(b, t1, 0.02)),
    '--dsw-alias-markdown-code-segment-selected': rgb(l1),
    '--dsw-alias-markdown-code-segment-unselected': rgb(mix(b, t1, dark ? 0.03 : 0.04)),
    // 滚动条
    '--dsw-alias-scrollbar-bg-l1': rgb(mix(t1, b, 0.85)),
    '--dsw-alias-scrollbar-bg-l2': rgb(mix(t1, b, 0.78)),
    '--dsw-alias-scrollbar-hover-l1': rgb(mix(t1, b, 0.72)),
    '--dsw-alias-scrollbar-hover-l2': rgb(mix(t1, b, 0.65)),
    // Toast / Tooltip
    '--dsw-alias-toast-bg': dark ? rgb(mix(l3, t1, 0.15)) : rgb(mix(t1, BLACK, 0.15)),
    '--dsw-alias-tooltip-bg': dark ? rgb(mix(l3, t1, 0.15)) : rgb(mix(t1, BLACK, 0.15)),
    // 领域专用
    '--dsw-specific-bubble': rgb(bubble),
    '--dsw-specific-bubble-highlight': rgb(bubbleHl),
    '--dsw-specific-sidebar-fill': rgb(sidebar),
    '--dsw-specific-sidebar-nav-item-active': rgb(navA),
    '--dsw-specific-sidebar-nav-item-active-accent': rgb(mix(brand, navA, 0.3)),
    '--dsw-specific-sidebar-nav-item-hover': rgb(navHl),
    '--dsw-specific-input-major': rgb(l1),
    '--dsw-specific-login-input': rgb(mix(b, l1, 0.5)),
    '--dsw-specific-selector': rgb(mix(l2, l3, 0.5)),
    '--dsw-specific-tip': rgb(mix(b, brand, 0.02)),
  }
}

// 组装 8 套主题:{ id, name, chip, tokens: { light, dark } }
const THEMES = {}
for (const [id, def] of Object.entries(THEME_DEFS)) {
  THEMES[id] = {
    id,
    name: def.name,
    chip: def.chip,
    tokens: { light: buildTokens('light', def.light), dark: buildTokens('dark', def.dark) },
  }
}

return {
  apply(ctx) {
    // 主题服务缺席(非 web 组合)时安静退出 —— 所有可选服务都按此惯例
    const theme = ctx.get('theme')
    if (theme === undefined) return

    // —— 激活即应用默认主题(卸载/停用自动还原) ——
    let current = 'aurora'
    let disposeLayer = theme.overrideTokens('aurora', THEMES[current].tokens)

    // 切换主题:移除旧调色层 → 叠加新层(同源重叠 = 替换整个层)
    const setTheme = (id) => {
      if (id === current || !THEMES[id]) return
      if (disposeLayer !== null) { disposeLayer(); disposeLayer = null }
      disposeLayer = theme.overrideTokens('aurora', THEMES[id].tokens)
      current = id
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

    slots.inject('settings.general.item', () => slots.register(
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
    ))
  },
}
