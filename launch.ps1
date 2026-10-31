param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$appPath = $PSScriptRoot
$url = 'http://localhost:3001'
$probeUrl = 'http://127.0.0.1:3001'
$mutex = New-Object System.Threading.Mutex($false, 'Local\ElectronicsCourseLauncher3001')
$locked = $false

function Test-CourseReady {
    try {
        $course = Invoke-RestMethod "$probeUrl/api/course" -TimeoutSec 2
        $html = (Invoke-WebRequest "$probeUrl/index.html" -UseBasicParsing -TimeoutSec 2).Content
        $expected = [IO.File]::ReadAllText((Join-Path $appPath 'public\index.html'))
        return ($course.topics -and $html -ceq $expected)
    } catch { return $false }
}

try {
    try { $locked = $mutex.WaitOne(45000) }
    catch [System.Threading.AbandonedMutexException] { $locked = $true }
    if (-not $locked) { throw 'Another launch is still in progress. Please try again.' }
    if (-not (Test-CourseReady)) {
        $client = New-Object System.Net.Sockets.TcpClient
        $portBusy = $false
        try { $client.Connect('127.0.0.1', 3001); $portBusy = $true }
        catch { }
        finally { $client.Dispose() }
        if ($portBusy) { throw 'Port 3001 is occupied by another site. Close it and try again.' }

        $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
        $entryPoint = Join-Path $appPath 'server\index.js'
        if (-not (Test-Path -LiteralPath $entryPoint)) { throw "Missing file: $entryPoint" }
        $logDir = Join-Path $appPath 'data\logs'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
        $errorLog = Join-Path $logDir "launch-$stamp.err.log"
        $previousPort = $env:PORT
        try {
            $env:PORT = '3001'
            $server = Start-Process -FilePath $nodePath -ArgumentList ('"' + $entryPoint + '"') -WorkingDirectory $appPath -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logDir "launch-$stamp.log") -RedirectStandardError $errorLog
        } finally { $env:PORT = $previousPort }
        $deadline = (Get-Date).AddSeconds(30)
        $ready = $false
        do {
            $server.Refresh()
            if ($server.HasExited) { throw "Server exited. Details: $errorLog" }
            if (Test-CourseReady) { $ready = $true; break }
            Start-Sleep -Milliseconds 400
        } while ((Get-Date) -lt $deadline)
        if (-not $ready) { throw "Server startup timed out. Details: $errorLog" }
    }
    if (-not $NoBrowser) { Start-Process $url }
    Write-Output "Ready: $url"
} catch {
    if (-not $NoBrowser) {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Electronics course: launch error') | Out-Null
    }
    Write-Error $_
    exit 1
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
