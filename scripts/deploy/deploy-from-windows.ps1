# Deploy Digital Clan Books to VPS from Windows
# Usage:
#   1. One time:  .\scripts\deploy\setup-ssh-key.ps1
#   2. Deploy:     .\scripts\deploy\deploy-from-windows.ps1
# Optional: -BooksDomain "books.yourdomain.com" -SkipServerSetup

param(
    [string]$BooksDomain = "books.digitalclanltd.com",
    [switch]$SkipServerSetup
)

$ErrorActionPreference = "Stop"
$Server = "root@129.121.97.148"
$AppDir = "/opt/books.digitalclanltd"
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$TarPath = Join-Path (Split-Path $ProjectRoot -Parent) "books-deploy.tar"
$KeyPath = Join-Path $env:USERPROFILE ".ssh\id_ed25519_dcb_deploy"

$SshBase = @("-o", "StrictHostKeyChecking=accept-new")
if (Test-Path $KeyPath) {
    $SshBase += @("-i", $KeyPath, "-o", "IdentitiesOnly=yes")
    Write-Host "==> Using SSH key (no password prompts)"
} else {
    Write-Host "==> No deploy key found. Run: .\scripts\deploy\setup-ssh-key.ps1"
    Write-Host "    (You will be prompted for the password on each SSH call until the key is set up.)"
}

function Invoke-Remote {
    param([string]$Command)
    & ssh @SshBase $Server $Command
    if ($LASTEXITCODE -ne 0) { throw "Remote command failed (exit $LASTEXITCODE): $Command" }
}

function Send-UnixFile {
    param([string]$LocalPath, [string]$RemotePath)
    $content = [System.IO.File]::ReadAllText($LocalPath) -replace "`r`n", "`n" -replace "`r", "`n"
    $temp = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($temp, $content, [System.Text.UTF8Encoding]::new($false))
        & scp @SshBase $temp "${Server}:${RemotePath}"
        if ($LASTEXITCODE -ne 0) { throw "scp failed uploading to ${RemotePath}" }
    } finally {
        Remove-Item $temp -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "==> Project: $ProjectRoot"
Write-Host "==> Server:  $Server"
Write-Host "==> Domain:  $BooksDomain"
Write-Host ""

Write-Host "==> Creating deployment archive..."
Push-Location $ProjectRoot
try {
    if (Test-Path $TarPath) { Remove-Item $TarPath -Force }
    tar -cf $TarPath `
        --exclude=node_modules `
        --exclude=frontend/node_modules `
        --exclude=.env `
        --exclude=frontend/dist `
        --exclude=.git `
        --exclude=__pycache__ `
        --exclude="*.pyc" `
        .
    Write-Host "    Archive: $TarPath ($([math]::Round((Get-Item $TarPath).Length / 1MB, 1)) MB)"
} finally {
    Pop-Location
}

if (-not $SkipServerSetup) {
    Write-Host ""
    Write-Host "==> Step 1/4: Prepare server (Git, Docker, firewall)..."
    Send-UnixFile (Join-Path $PSScriptRoot "setup-server.sh") "/tmp/setup-server.sh"
    Invoke-Remote "bash /tmp/setup-server.sh"
} else {
    Write-Host ""
    Write-Host "==> Step 1/4: Skipped (-SkipServerSetup)"
}

Write-Host ""
Write-Host "==> Step 2/4: Upload project archive..."
Invoke-Remote "mkdir -p $AppDir"
& scp @SshBase $TarPath "${Server}:${AppDir}/books-deploy.tar"
if ($LASTEXITCODE -ne 0) { throw "scp failed uploading archive" }

Write-Host ""
Write-Host "==> Step 3/4: Extract project on server..."
Invoke-Remote "cd $AppDir && tar xf books-deploy.tar && rm -f books-deploy.tar && sed -i 's/\r$//' scripts/deploy/*.sh .env 2>/dev/null; chmod +x scripts/deploy/*.sh"

Write-Host ""
Write-Host "==> Step 4/4: Build Docker containers and seed database..."
Invoke-Remote "cd $AppDir && if grep -q '^BOOKS_DOMAIN=' .env 2>/dev/null; then sed -i 's|^BOOKS_DOMAIN=.*|BOOKS_DOMAIN=$BooksDomain|' .env; else echo BOOKS_DOMAIN=$BooksDomain >> .env; fi && bash scripts/deploy/deploy-app.sh"

Write-Host ""
Write-Host "=========================================="
Write-Host " Done! Open: https://$BooksDomain"
Write-Host " Admin credentials were printed above"
Write-Host " (also in $AppDir/.env on the server)"
Write-Host "=========================================="
