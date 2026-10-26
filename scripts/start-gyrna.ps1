param([switch]$NoBrowser, [switch]$StopServers)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $projectRoot 'frontend'

# Validate every occupied port before stopping anything. Leave other projects alone.
$listeners = @(Get-NetTCPConnection -State Listen -LocalPort 8017,4173 -ErrorAction SilentlyContinue)
$serverIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($serverId in $serverIds) {
    $server = Get-CimInstance Win32_Process -Filter "ProcessId = $serverId"
    if (!$server.CommandLine -or
        ($server.CommandLine.IndexOf($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase) -lt 0) -or
        !($server.CommandLine -match 'uvicorn app\.main:app|vite[\\/].*preview')) {
        throw "Port 8017 or 4173 belongs to another process ($serverId). It was not stopped."
    }
}

if ($StopServers) {
    foreach ($serverId in $serverIds) { Stop-Process -Id $serverId -ErrorAction SilentlyContinue }
    Write-Host 'Wheelero servers stopped.'
    exit 0
}

$bunPath = (Get-Command bun -CommandType Application).Source
if (!(Test-Path -LiteralPath (Join-Path $frontendPath 'node_modules') -PathType Container)) {
    throw 'Frontend dependencies missing. Run bun install in frontend first.'
}

Write-Host 'Building the latest Wheelero version. Please wait...'
Set-Location -LiteralPath $frontendPath
& $bunPath run build
if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed. Existing servers were left running.' }

foreach ($serverId in $serverIds) {
    Stop-Process -Id $serverId -ErrorAction SilentlyContinue
}

$logsPath = Join-Path $projectRoot 'artifacts'
New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
Write-Host 'Starting the static Wheelero website...'
Start-Process -FilePath $bunPath -ArgumentList 'run','preview','--port','4173','--strictPort' `
    -WorkingDirectory $frontendPath -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logsPath 'launcher-frontend.log') `
    -RedirectStandardError (Join-Path $logsPath 'launcher-frontend-error.log')

$launchUrl = 'http://localhost:4173/launch.html'
$ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
        $page = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4173/launch.html' -TimeoutSec 2
        if ($page.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch [System.Net.WebException] {
        # Connection refused is expected while the new servers start.
    }
    Start-Sleep -Milliseconds 500
}
if (!$ready) { throw "Startup failed. See launcher logs in $logsPath" }

Write-Host "Ready: $launchUrl"
Write-Host 'The latest build opens without clearing your wheels or browser storage.'
if (!$NoBrowser) { Start-Process $launchUrl }
