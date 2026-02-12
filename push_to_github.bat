@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd"

echo ========================================
echo Number Bridge - GitHub Publisher (Auto)
echo ========================================
echo.

echo [1/4] Checking Git...
git --version
if %errorlevel% neq 0 (
    echo Error: Git not found.
    pause
    exit /b
)

echo [2/4] Checking Repository...
if not exist .git (
    echo Initializing repo...
    git init
)

echo [3/4] Committing...
git add .
git commit -m "Auto-update"

echo [4/4] Pushing to GitHub...
echo Note: If this fails, you may need a VPN.
echo.

REM Try direct push first
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------
    echo [ERROR] Push Failed!
    echo ----------------------------------------
    echo Common reasons:
    echo 1. Network timeout (Please turn on VPN/Proxy)
    echo 2. Permission denied (Check GitHub login)
    echo.
    echo If you have a proxy (e.g. Clash), edit this file and uncomment the proxy lines.
    echo.
) else (
    echo.
    echo [SUCCESS] Push Complete!
)

echo.
echo Press any key to exit...
pause
