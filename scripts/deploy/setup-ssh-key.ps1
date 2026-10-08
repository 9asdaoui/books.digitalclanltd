# One-time setup: install your SSH public key on the VPS so deploys need no password.
# Usage: .\scripts\deploy\setup-ssh-key.ps1
# Enter the root password ONCE when prompted - it is never saved to disk.

$ErrorActionPreference = "Stop"
$Server = "root@129.121.97.148"
$SshDir = Join-Path $env:USERPROFILE ".ssh"
$KeyPath = Join-Path $SshDir "id_ed25519_dcb_deploy"

if (-not (Test-Path $SshDir)) {
    New-Item -ItemType Directory -Path $SshDir -Force | Out-Null
}

if (-not (Test-Path $KeyPath)) {
    Write-Host "==> Creating deploy key: $KeyPath"
    ssh-keygen -t ed25519 -f $KeyPath -N '""' -C "digitalclan-books-deploy"
} else {
    Write-Host "==> Using existing key: $KeyPath"
}

Write-Host ""
Write-Host "==> Copying public key to server (enter root password once)..."
$pub = Get-Content "$KeyPath.pub" -Raw
$pub | ssh -o StrictHostKeyChecking=accept-new $Server "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys"

Write-Host ""
Write-Host "==> Testing passwordless login..."
ssh -i $KeyPath -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new $Server "echo SSH key auth OK"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! Future deploys will use the key - no password needed."
} else {
    throw "SSH key test failed"
}
