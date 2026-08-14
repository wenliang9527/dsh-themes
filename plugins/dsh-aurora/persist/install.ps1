# ============================================================
#  dsh-aurora one-click persistent install script
#  Usage:  powershell -ExecutionPolicy Bypass -File install.ps1
#  Notes:  - requires DSH installed at D:\WORK_VSCODE\Vibe-coding\deepseekH
#          - requires DSH_HOME at C:\Users\<user>\.dsh (or $env:DSH_HOME)
#          - after any `npm install` (which may prune node_modules),
#            re-run this script to restore the package
# ============================================================

$ErrorActionPreference = 'Stop'

$persist = $PSScriptRoot
if (-not (Test-Path (Join-Path $persist 'package.json'))) {
  Write-Host "ERROR: persist folder not found next to this script: $persist"
  exit 1
}

# 1) dsh install closure node_modules (client-modules require.resolve base)
$loaderTarget = 'D:\WORK_VSCODE\Vibe-coding\deepseekH\node_modules\dsh-aurora'
# 2) web profile node_modules (loader ESM resolution walks up from baseUrl)
$profileDir = Join-Path $env:USERPROFILE '.dsh\profiles\web'
$profileTarget = Join-Path $profileDir 'node_modules\dsh-aurora'

foreach ($target in @($loaderTarget, $profileTarget)) {
  if (Test-Path $target) { Remove-Item $target -Recurse -Force }
  New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
  Copy-Item -Path $persist -Destination $target -Recurse
  Write-Host "installed -> $target"
}

# 3) update cordis.patch.yml so the dsh-aurora entry uses the package name
$patch = Join-Path $profileDir 'cordis.patch.yml'
$text = [System.IO.File]::ReadAllText($patch)

# remove the legacy relative-path entry block, if present
$oldPattern = '(?m)^\s*- insert:\r?\n\s+- id: dsh-aurora\r?\n\s+name: [^\r\n]+\r?\n?'
if ($text -match $oldPattern) {
  $text = [regex]::Replace($text, $oldPattern, '')
  Write-Host 'removed legacy relative-path entry'
}

if ($text -notmatch 'id: dsh-aurora') {
  $nl = "`r`n"
  $block = $nl + '# ============================================================' + $nl +
    '# dsh-aurora (Aurora theme, persistent): insert the loader entry' + $nl +
    '# To uninstall: delete this block, delete profiles\web\dsh-aurora, restart dsh' + $nl +
    '# ============================================================' + $nl +
    '- insert:' + $nl +
    '    - id: dsh-aurora' + $nl +
    '      name: dsh-aurora' + $nl
  $text = $text.TrimEnd() + $block
  Write-Host 'appended dsh-aurora entry (package-name form)'
} else {
  Write-Host 'dsh-aurora entry already present'
}

[System.IO.File]::WriteAllText($patch, $text, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "patch updated -> $patch"
Write-Host ''
Write-Host 'Done. Restart the harness (npm run dsh) and refresh the browser page.'
