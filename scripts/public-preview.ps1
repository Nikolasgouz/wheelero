param([switch]$Stop)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$artifacts = Join-Path $projectRoot 'artifacts'
$statePath = Join-Path $artifacts 'public-preview.json'
$pythonPath = Join-Path $projectRoot '.venv\Scripts\python.exe'
$bunPath = (Get-Command bun -CommandType Application).Source
$tunnelPath = Join-Path $artifacts 'tools\cloudflared.exe'

function Stop-PreviewProcess([int]$processId) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
    if (!$process) { return }
    if ($process.ExecutablePath -eq $tunnelPath) {
        Stop-Process -Id $processId
        return
    }
    if ($process.ExecutablePath -eq $bunPath -and $process.CommandLine -match 'run.*preview.*8018') {
        foreach ($listener in @(Get-NetTCPConnection -State Listen -LocalPort 8018 -ErrorAction SilentlyContinue)) {
            $server = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
            if (!$server.CommandLine.Contains($projectRoot) -or $server.CommandLine -notmatch 'vite.*preview') {
                throw 'Port 8018 no longer belongs to this preview; it was not stopped.'
            }
            Stop-Process -Id $server.ProcessId -ErrorAction SilentlyContinue
        }
        Get-CimInstance Win32_Process -Filter "ParentProcessId = $processId" |
            Where-Object { $_.CommandLine -match 'vite.*preview' -and $_.CommandLine.Contains($projectRoot) } |
            ForEach-Object { Stop-Process -Id $_.ProcessId }
        Stop-Process -Id $processId -ErrorAction SilentlyContinue
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

    $env:PUBLIC_URL = $state.url
    $env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = ([uri]$state.url).Host
    $env:PUBLIC_INDEXING = 'false'
    Set-Location -LiteralPath (Join-Path $projectRoot 'frontend')
    & $bunPath run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
    $server = Start-Process -FilePath $bunPath -PassThru -WindowStyle Hidden `
        -ArgumentList 'run','preview','--host','127.0.0.1','--port','8018','--strictPort' `
        -WorkingDirectory (Join-Path $projectRoot 'frontend') `
        -RedirectStandardOutput (Join-Path $artifacts 'public-static.log') `
        -RedirectStandardError (Join-Path $artifacts 'public-static-error.log')
    $state.processIds += $server.Id
    $state | ConvertTo-Json | Set-Content -LiteralPath $statePath
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $health = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8018/' -TimeoutSec 2 `
                -Headers @{ Host = ([uri]$state.url).Host }
            if ($health.StatusCode -eq 200) { $ready = $true; break }
        } catch [System.Net.WebException] {
            # Connection refused is expected while the preview server starts.
        }
        if ($server.HasExited) { throw 'Preview server exited. See public-static-error.log.' }
        Start-Sleep -Milliseconds 500
    }
    if (!$ready) { throw 'Static preview did not become ready.' }
    Write-Host "Public preview: $($state.url)"
    Write-Host 'Keep this computer awake and online. Stop with scripts/public-preview.ps1 -Stop.'
} catch {
    foreach ($processId in $state.processIds) {
        Stop-PreviewProcess $processId
    }
    Remove-Item -LiteralPath $statePath -ErrorAction SilentlyContinue
    throw
}
