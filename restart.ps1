[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 3001,
    [string]$AppPath = 'C:\education\electronics-course'
)

$ErrorActionPreference = 'Stop'
$AppPath = (Resolve-Path -LiteralPath $AppPath).Path
$entryPoint = Join-Path $AppPath 'server\index.js'
if (-not (Test-Path -LiteralPath $entryPoint)) {
    throw "Application entry point not found: $entryPoint"
}
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$url = "http://127.0.0.1:$Port"
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop |
    Where-Object LocalPort -eq $Port |
    Select-Object -ExpandProperty OwningProcess -Unique)

foreach ($processId in $listeners) {
    $serverProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
    $command = $serverProcess.CommandLine -replace '/', '\'
    $absoluteEntry = '(?:^|\s)"?' + [regex]::Escape($entryPoint) + '"?\s*$'
    $relativeEntry = '(?:^|\s)"?(?:\.\\)?server\\index\.js"?\s*$'
    if ($serverProcess.Name -ne 'node.exe' -or
        ($command -notmatch $absoluteEntry -and $command -notmatch $relativeEntry)) {
        throw "Port $Port belongs to another application (PID $processId). Nothing was stopped."
    }
    # A relative npm-start command does not identify its working directory.
    # Check that the listener serves this course before stopping it.
    if ($command -notmatch $absoluteEntry) {
        $course = Invoke-RestMethod "$url/api/course" -TimeoutSec 5
        $servedHtml = (Invoke-WebRequest "$url/index.html" -UseBasicParsing -TimeoutSec 5).Content
        $localHtml = [IO.File]::ReadAllText((Join-Path $AppPath 'public\index.html'))
        if (-not $course.topics -or $servedHtml -cne $localHtml) {
            throw "Port $Port does not serve the expected course. Nothing was stopped."
        }
    }
    $parent = Get-CimInstance Win32_Process -Filter "ProcessId = $($serverProcess.ParentProcessId)"
    if ($parent.Name -eq 'node.exe' -and $parent.CommandLine -match '(?:^|\s)--watch(?:\s|=)') {
        throw 'The application is running in watch mode. Stop npm run dev in its terminal first.'
    }
}

if (-not $PSCmdlet.ShouldProcess("$AppPath on port $Port", 'Restart application')) { return }

foreach ($processId in $listeners) {
    Stop-Process -Id $processId -ErrorAction Stop
    Wait-Process -Id $processId -Timeout 10 -ErrorAction SilentlyContinue
}

$logDir = Join-Path $AppPath 'data\logs'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$stdout = Join-Path $logDir "server-$stamp.log"
$stderr = Join-Path $logDir "server-$stamp.err.log"
$previousPort = $env:PORT
try {
    $env:PORT = [string]$Port
    $started = Start-Process -FilePath $nodePath -ArgumentList ('"' + $entryPoint + '"') `
        -WorkingDirectory $AppPath -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr
}
finally {
    $env:PORT = $previousPort
}

$deadline = (Get-Date).AddSeconds(30)
do {
    $started.Refresh()
    if ($started.HasExited) {
        throw "Server exited. See $stderr"
    }
    try {
        $ready = Invoke-RestMethod "$url/api/course" -TimeoutSec 2
        $owner = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
            Where-Object OwningProcess -eq $started.Id)
        if ($ready.topics -and $owner.Count -gt 0) {
            Write-Host "Application ready: $url (PID $($started.Id))"
            Write-Host "Refresh the browser page. Logs: $logDir"
            return
        }
    }
    catch { }
    Start-Sleep -Milliseconds 500
} while ((Get-Date) -lt $deadline)
throw "Server did not become ready within 30 seconds. PID: $($started.Id). See $stderr"
