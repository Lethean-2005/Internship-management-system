# ============================================
# IMS Deployment Script for Windows Server (IIS)
# ============================================

$ErrorActionPreference = "Stop"
$DEPLOY_PATH = "C:\inetpub\wwwroot\ims"

Write-Host "=== Step 1: Install PHP 8.3 ===" -ForegroundColor Cyan
if (!(Test-Path "C:\php\php.exe")) {
    Invoke-WebRequest -Uri "https://windows.php.net/downloads/releases/php-8.3.21-Win32-vs16-x64.zip" -OutFile "C:\php8.3.zip" -UseBasicParsing
    Expand-Archive -Path "C:\php8.3.zip" -DestinationPath "C:\php" -Force
    Remove-Item "C:\php8.3.zip"
    [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\php", "Machine")
    $env:Path += ";C:\php"

    # Configure php.ini
    Copy-Item "C:\php\php.ini-production" "C:\php\php.ini"
    $ini = Get-Content "C:\php\php.ini"
    $ini = $ini -replace ';extension_dir = "ext"', 'extension_dir = "C:\php\ext"'
    $ini = $ini -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite'
    $ini = $ini -replace ';extension=sqlite3', 'extension=sqlite3'
    $ini = $ini -replace ';extension=openssl', 'extension=openssl'
    $ini = $ini -replace ';extension=mbstring', 'extension=mbstring'
    $ini = $ini -replace ';extension=fileinfo', 'extension=fileinfo'
    $ini = $ini -replace ';extension=curl', 'extension=curl'
    $ini | Set-Content "C:\php\php.ini"
    Write-Host "PHP 8.3 installed and configured." -ForegroundColor Green
} else {
    Write-Host "PHP already installed." -ForegroundColor Yellow
}

Write-Host "`n=== Step 2: Install Composer ===" -ForegroundColor Cyan
if (!(Get-Command composer -ErrorAction SilentlyContinue)) {
    Invoke-WebRequest -Uri "https://getcomposer.org/Composer-Setup.exe" -OutFile "C:\composer-setup.exe" -UseBasicParsing
    Start-Process -FilePath "C:\composer-setup.exe" -ArgumentList "/SILENT" -Wait
    $env:Path += ";C:\ProgramData\ComposerSetup\bin"
    Write-Host "Composer installed." -ForegroundColor Green
} else {
    Write-Host "Composer already installed." -ForegroundColor Yellow
}

Write-Host "`n=== Step 3: Install IIS URL Rewrite ===" -ForegroundColor Cyan
$rewriteCheck = Get-WebGlobalModule -Name "RewriteModule" -ErrorAction SilentlyContinue
if (!$rewriteCheck) {
    Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi" -OutFile "C:\rewrite.msi" -UseBasicParsing
    Start-Process msiexec -ArgumentList "/i C:\rewrite.msi /quiet" -Wait
    Write-Host "URL Rewrite installed." -ForegroundColor Green
} else {
    Write-Host "URL Rewrite already installed." -ForegroundColor Yellow
}

Write-Host "`n=== Step 4: Register PHP with IIS ===" -ForegroundColor Cyan
$cgiCheck = Get-WebHandler -Name "PHP_via_FastCGI" -ErrorAction SilentlyContinue
if (!$cgiCheck) {
    Add-WebConfiguration //globalModules -Value @{name='FastCgiModule';image='%windir%\System32\inetsrv\iisfcgi.dll'}  -ErrorAction SilentlyContinue
    Add-WebHandler -Name "PHP_via_FastCGI" -Path "*.php" -Verb "*" -Modules "FastCgiModule" -ScriptProcessor "C:\php\php-cgi.exe" -ResourceType Either
    Write-Host "PHP registered with IIS." -ForegroundColor Green
} else {
    Write-Host "PHP handler already registered." -ForegroundColor Yellow
}

Write-Host "`n=== Step 5: Deploy Application ===" -ForegroundColor Cyan
# Clean old deployment
if (Test-Path $DEPLOY_PATH) {
    Remove-Item -Path $DEPLOY_PATH -Recurse -Force
}

# Copy backend (which now includes the built frontend in public/)
Copy-Item -Path "BACKEND_SOURCE_PATH" -Destination $DEPLOY_PATH -Recurse

# Install PHP dependencies
Set-Location $DEPLOY_PATH
composer install --no-dev --optimize-autoloader

Write-Host "`n=== Step 6: Configure Environment ===" -ForegroundColor Cyan
Copy-Item "$DEPLOY_PATH\.env.example" "$DEPLOY_PATH\.env"
C:\php\php.exe artisan key:generate --force

# Create SQLite database
$dbPath = "$DEPLOY_PATH\database\database.sqlite"
if (!(Test-Path $dbPath)) {
    New-Item -Path $dbPath -ItemType File
}

# Run migrations and seed
C:\php\php.exe artisan migrate --seed --force

# Cache config for production
C:\php\php.exe artisan config:cache
C:\php\php.exe artisan route:cache
C:\php\php.exe artisan view:cache

# Create storage link
C:\php\php.exe artisan storage:link

Write-Host "`n=== Step 7: Set Permissions ===" -ForegroundColor Cyan
icacls "$DEPLOY_PATH\storage" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "$DEPLOY_PATH\bootstrap\cache" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "$DEPLOY_PATH\database" /grant "IIS_IUSRS:(OI)(CI)F" /T

Write-Host "`n=== Step 8: Configure IIS Site ===" -ForegroundColor Cyan
Import-Module WebAdministration
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name physicalPath -Value "$DEPLOY_PATH\public"

Write-Host "`n=== Step 9: Restart IIS ===" -ForegroundColor Cyan
iisreset

Write-Host "`n=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Visit: http://98.81.97.157" -ForegroundColor Green
