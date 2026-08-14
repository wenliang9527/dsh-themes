// Verify the persistent install end-to-end (mirrors client-modules + loader contracts).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const reqYaml = createRequire(import.meta.url)
const YAML = reqYaml('D:/WORK_VSCODE/Vibe-coding/deepseekH/node_modules/yaml')

// 1) patch structure
const patch = readFileSync('C:/Users/46166/.dsh/profiles/web/cordis.patch.yml', 'utf8')
const doc = YAML.parse(patch)
const aurora = doc.find((e) => e.insert && e.insert.some((x) => x.id === 'dsh-aurora'))
const wheel = doc.find((e) => e.insert && e.insert.some((x) => x.id === 'mcp-findawheel'))
console.log('aurora block:', JSON.stringify(aurora?.insert[0]))
console.log('findawheel block intact:', !!wheel && wheel.insert[0].name === '@deepseek-ai/dsh-mcp-client')
if (!aurora || !wheel) process.exit(1)

// 2) simulate client-modules resolvePkgJson
const req = createRequire('D:/WORK_VSCODE/Vibe-coding/deepseekH/node_modules/@deepseek-ai/dsh-client-modules/lib/index.js')
const pkgPath = req.resolve('dsh-aurora/package.json')
console.log('client-modules resolvePkgJson OK:', pkgPath)
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
console.log('pkg name:', pkg.name, '| exports keys:', Object.keys(pkg.exports))

// 3) simulate loader ESM resolution from profile baseUrl
const base = 'file:///C:/Users/46166/.dsh/profiles/web/'
const resolved = import.meta.resolve('dsh-aurora', base)
console.log('loader ESM resolve OK:', resolved)
const mod = await import(resolved)
const plugin = mod.default ?? mod
console.log('loader import OK | plugin.apply:', typeof plugin.apply === 'function')
