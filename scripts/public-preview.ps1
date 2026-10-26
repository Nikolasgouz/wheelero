param([switch]$Stop)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$artifacts = Join-Path $projectRoot 'artifacts'
$statePath = Join-Path $artifacts 'public-preview.json'
$pythonPath = Join-Path $projectRoot '.venv\Scripts\python.exe'
$tunnelPath = Join-Path $artifacts 'tools\cloudflared.exe'

function Stop-PreviewProcess([int]$processId) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
    if (!$process) { return }
    if ($process.ExecutablePath -eq $tunnelPath) {
        Stop-Process -Id $processId
        return
    }
    if ($process.ExecutablePath -ne $pythonPath -or
        $process.CommandLine -notmatch 'uvicorn app\.preview:app') {
        throw "Process $processId no longer belongs to this preview; it was not stopped."
    }
    # Windows venv Python forwards to a child interpreter; stop that server too.
    Get-CimInstance Win32_Process -Filter "ParentProcessId = $processId" |
        Where-Object { $_.CommandLine -eq $process.CommandLine } |
        ForEach-Object { Stop-Process -Id $_.ProcessId }
    Stop-Process -Id $processId -ErrorAction SilentlyContinue
}

if (Test-Path -LiteralPath $statePath) {
    $state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    foreach ($processId in $state.processIds) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
        if (!$process) { continue }
        if (!$Stop) { throw "Preview already running at $($state.url). Use -Stop first." }
        Stop-PreviewProcess $processId
    }
    Remove-Item -LiteralPath $statePath
}
if ($Stop) { Write-Host 'Public preview stopped.'; exit 0 }
if (Get-NetTCPConnection -State Listen -LocalPort 8018 -ErrorAction SilentlyContinue) {
    throw 'Port 8018 is already in use. No existing server was stopped.'
}

New-Item -ItemType Directory -Path (Split-Path $tunnelPath) -Force | Out-Null
if (!(Test-Path -LiteralPath $tunnelPath)) {
    Invoke-WebRequest -UseBasicParsing -OutFile $tunnelPath -Uri `
        'https://github.com/cloudflare/cloudflared/releases/download/2026.10.3/cloudflared-windows-amd64.exe'
}
$expectedHash = '76B2805253D0D6FFACB092A7ACFBEE99E7AF6917835C0C5410E23F3EF5052DA2'
if ((Get-FileHash -LiteralPath $tunnelPath -Algorithm SHA256).Hash -ne $expectedHash) {
    throw 'cloudflared checksum does not match the pinned official release.'
}

Set-Location -LiteralPath (Join-Path $projectRoot 'frontend')
& bun run build
if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }

$state = @{ processIds = @(); url = '' }
try {
    $tunnel = Start-Process -FilePath $tunnelPath -PassThru -WindowStyle Hidden `
        -ArgumentList 'tunnel','--no-autoupdate','--protocol','http2','--url','http://127.0.0.1:8018' `
        -RedirectStandardOutput (Join-Path $artifacts 'public-tunnel.log') `
        -RedirectStandardError (Join-Path $artifacts 'public-tunnel-error.log')
    $state.processIds += $tunnel.Id
    $state | ConvertTo-Json | Set-Content -LiteralPath $statePath
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        $output = Get-Content -LiteralPath (Join-Path $artifacts 'public-tunnel-error.log') -Raw
        if ($output -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
            $state.url = $Matches[0]
            break
        }
        if ($tunnel.HasExited) { throw 'Tunnel exited. See artifacts/public-tunnel-error.log.' }
        Start-Sleep -Milliseconds 500
    }
    if (!$state.url) { throw 'Tunnel did not return a URL within 30 seconds.' }

    $env:DATABASE_URL = 'sqlite:///' + (Join-Path $artifacts 'public-preview.db').Replace('\','/')
    $env:COOKIE_SECURE = 'true'
    $env:ALLOWED_ORIGINS = $state.url
    Set-Location -LiteralPath (Join-Path $projectRoot 'backend')
    & $pythonPath -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw 'Preview database migration failed.' }
    $server = Start-Process -FilePath $pythonPath -PassThru -WindowStyle Hidden `
        -ArgumentList '-m','uvicorn','app.preview:app','--host','127.0.0.1','--port','8018','--no-access-log' `
        -WorkingDirectory (Join-Path $projectRoot 'backend') `
        -RedirectStandardOutput (Join-Path $artifacts 'public-backend.log') `
        -RedirectStandardError (Join-Path $artifacts 'public-backend-error.log')
    $state.processIds += $server.Id
    $state | ConvertTo-Json | Set-Content -LiteralPath $statePath
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $health = Invoke-RestMethod 'http://127.0.0.1:8018/api/health' -TimeoutSec 2 `
                -Headers @{ Host = ([uri]$state.url).Host }
            if ($health.status -eq 'ok') { $ready = $true; break }
        } catch [System.Net.WebException] {
            # Connection refused is expected while the preview server starts.
        }
        if ($server.HasExited) { throw 'Preview server exited. See public-backend-error.log.' }
        Start-Sleep -Milliseconds 500
    }
    if (!$ready) { throw 'Preview backend did not become ready.' }
    Write-Host "Public preview: $($state.url)"
    Write-Host 'Keep this computer awake and online. Stop with scripts/public-preview.ps1 -Stop.'
} catch {
    foreach ($processId in $state.processIds) {
        Stop-PreviewProcess $processId
    }
    Remove-Item -LiteralPath $statePath -ErrorAction SilentlyContinue
    throw
}
