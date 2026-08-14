// Verify the 8-theme build: syntax, generation, token validity, switching, dual-version parity.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const req = createRequire(import.meta.url)

const ROOT = 'D:/WORK_VSCODE/Vibe-coding/DSHK/Plugin/plugins/dsh-aurora'
const css = readFileSync('D:/WORK_VSCODE/Vibe-coding/deepseekH/node_modules/@deepseek-ai/dsh-client-ui-theme/lib/styles/design-platform.css', 'utf8')
const OFFICIAL = new Set([...css.matchAll(/--dsw-[\w-]+/g)].map((m) => m[0]))

// --- helper: evaluate a dynamic client half exactly like the DSH closure ---
async function evalDynamic(src) {
  const closure = new Function('React', 'console', 'styles', 'host', 'harness', 'return (async () => {\n' + src + '\n})()')
  const React = { createElement: (...a) => ({ a }), useState: (v) => [v, () => {}], useEffect: () => {} }
  return closure(React, console, { insert: () => {} }, { call: async () => ({}) }, {})
}

// --- helper: evaluate a persist bundle via __ModuleLoader__.load ---
function evalBundle(src) {
  let handoff = null
  const window = { __ModuleLoader__: { load: (h) => { handoff = h } } }
  const fn = new Function('window', src)
  fn(window)
  if (!handoff || typeof handoff.factory !== 'function') throw new Error('no bundle handoff')
  const React = { createElement: (...a) => ({ a }), useState: (v) => [v, () => {}], useEffect: () => {} }
  const mod = handoff.factory((spec) => (spec === 'react' ? React : (() => { throw new Error('unexpected require: ' + spec) })()))
  return { id: handoff.id, plugin: mod.default ?? mod }
}

// --- simulate theme + slots services and exercise the plugin ---
// The fake overrideTokens mirrors the REAL rc.6 contract: tokens is a FLAT map
// token -> { light, dark } (both strings). A bare string or per-scheme nested
// map is exactly the runtime error we must catch here.
function makeCtx(record) {
  const theme = {
    overrideTokens: (src, tokens) => {
      const keys = Object.keys(tokens)
      record.layers.push({ src, count: keys.length })
      for (const [k, v] of Object.entries(tokens)) {
        if (typeof v !== 'object' || v === null) {
          throw new Error('BARE VALUE for ' + k + ' (must be { light, dark } pair): ' + JSON.stringify(v))
        }
        if (typeof v.light !== 'string' || typeof v.dark !== 'string') {
          throw new Error('BAD PAIR for ' + k + ': ' + JSON.stringify(v))
        }
        if (!OFFICIAL.has(k)) throw new Error('non-official token: ' + k)
        // every value must be a literal hex color or a native color-mix()
        // expression — leftover JS rgb()/rgba() output is a build regression
        const okColor = (s) => /^#[\da-f]{6}$/i.test(s) || s.indexOf('color-mix(') === 0
        if (!okColor(v.light) || !okColor(v.dark)) {
          throw new Error('UNEXPECTED COLOR for ' + k + ': ' + JSON.stringify(v))
        }
      }
      return () => { record.disposed.push(src) }
    },
  }
  let reg = null
  const slots = {
    inject: (name, factory) => { reg = { name, factory }; return () => { record.slotDisposed = true } },
    register: (opts, comp) => { reg.opts = opts; reg.comp = comp; return () => {} },
  }
  const ctx = { get: (n) => (n === 'theme' ? theme : n === 'slots' ? slots : undefined) }
  return { ctx, getReg: () => reg }
}

// --- fake browser storage for the persistence test (globalThis.localStorage) ---
const storageMap = new Map()
globalThis.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => { storageMap.set(k, String(v)) },
}
const STORAGE_KEY = 'dsh-aurora/settings/v1'

// --- run both halves ---
for (const [label, src, isBundle] of [
  ['dynamic', readFileSync(ROOT + '/client.js', 'utf8'), false],
  ['persist', readFileSync(ROOT + '/persist/client.js', 'utf8'), true],
]) {
  storageMap.clear()
  const record = { layers: [], disposed: [], slotDisposed: false }
  const plugin = isBundle ? evalBundle(src).plugin : await evalDynamic(src)
  if (!plugin || typeof plugin.apply !== 'function') throw new Error(label + ': not a plugin')
  const { ctx, getReg } = makeCtx(record)
  const cleanup = plugin.apply(ctx)

  // 1) activation applied exactly one layer with 80 tokens (each a { light, dark } pair)
  if (record.layers.length !== 1 || record.layers[0].count !== 80) throw new Error(label + ': activation wrong: ' + JSON.stringify(record.layers))

  // 2) settings row registered; activation must NOT write storage
  const reg = getReg()
  if (!reg) throw new Error(label + ': row factory not injected')
  reg.factory()
  if (!reg.opts || reg.opts.id !== 'aurora-theme') throw new Error(label + ': row not registered')
  const injected = reg.opts.inject()
  if (injected.getCurrent() !== 'aurora') throw new Error(label + ': initial theme wrong')
  if (storageMap.has(STORAGE_KEY)) throw new Error(label + ': activation must not write storage')

  // 3) switch through all 8 themes: each replaces the layer (same source), all 80 tokens
  const themes = ['aurora', 'sakura', 'bamboo', 'violet', 'amber', 'abyss', 'graphite', 'midnight']
  for (const id of themes.slice(1)) {
    injected.setTheme(id)
    if (injected.getCurrent() !== id) throw new Error(label + ': switch to ' + id + ' failed')
  }
  const last = record.layers[record.layers.length - 1]
  if (last.count !== 80) throw new Error(label + ': last layer wrong')
  // switching must have disposed intermediate layers (dynamic facade also auto-hangs, fine)
  if (record.disposed.length < 6) throw new Error(label + ': expected dispose calls, got ' + record.disposed.length)

  // 3b) persistence: last switch wrote the versioned key; a fresh activation
  //     restores it; an unknown stored id falls back to the default
  if (storageMap.get(STORAGE_KEY) !== 'midnight') throw new Error(label + ': saved theme wrong: ' + storageMap.get(STORAGE_KEY))
  if (typeof cleanup === 'function') cleanup()
  plugin.apply(ctx)
  getReg().factory()
  if (getReg().opts.inject().getCurrent() !== 'midnight') throw new Error(label + ': saved theme not restored')
  storageMap.set(STORAGE_KEY, 'not-a-theme')
  plugin.apply(ctx)
  getReg().factory()
  if (getReg().opts.inject().getCurrent() !== 'aurora') throw new Error(label + ': unknown saved id must fall back')

  // 4) render the row component (8 chips)
  reg.comp({ ...injected })

  // 5) cleanup (persist half returns a disposer)
  if (typeof cleanup === 'function') cleanup()

  console.log(label + ' OK | layers:', record.layers.length, '| tokens/layer:', last.count, '| switch cycle: 8 themes | row: ' + reg.opts.id)
}

// --- dual-version parity: identical key sets + identical generator/palette source ---
const a = readFileSync(ROOT + '/client.js', 'utf8')
const b = readFileSync(ROOT + '/persist/client.js', 'utf8')
const keys = (src) => [...src.matchAll(/'--dsw-[\w-]+':/g)].map((m) => m[0])
const ka = keys(a)
const kb = keys(b)
if (ka.length !== 80 || kb.length !== 80) throw new Error('token key count wrong: ' + ka.length + ' / ' + kb.length)
if (ka.length !== kb.length || ka.some((x, i) => x !== kb[i])) throw new Error('token key sets differ between halves')
const seg = (src, name) => {
  const m = src.match(new RegExp('function ' + name + '\\([\\s\\S]*?\\n\\s*\\}'))
  if (!m) throw new Error('function not found: ' + name)
  return m[0].replace(/^[ \t]+/gm, '').trim()
}
// The generator + palette region (buildTokens → THEMES assembly) must be
// byte-identical (modulo indentation) between the two halves, which
// guarantees identical output.
const region = (src) => {
  const start = src.indexOf('function buildTokens')
  const end = src.indexOf('// 组装 8 套主题')
  if (start < 0 || end < 0) throw new Error('region anchors not found')
  return src
    .slice(start, end)
    .replace(/^[ \t]+/gm, '')
    .split('\n')
    .map((l) => l.replace(/\s*\/\/.*$/, '')) // strip comments (they may differ; code must not)
    .filter((l) => l.trim().length > 0)
    .join('\n')
    .trim()
}
if (region(a) !== region(b)) throw new Error('generator/palette region differs between halves')
console.log('parity OK |', ka.length, 'token keys + generator + 8 palettes identical in both halves')
