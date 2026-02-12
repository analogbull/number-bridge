@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd"

echo ========================================
echo Number Bridge - Smart Publisher
echo ========================================

REM 1. Commit changes first
if not exist .git git init
git add .
git commit -m "Auto-update" 2>nul

echo.
echo [Attempt 1] Trying DIRECT connection...
echo (Clearing old proxy settings...)
git config --global --unset http.proxy
git config --global --unset https.proxy
git push -u origin main

if %errorlevel% equ 0 goto SUCCESS

echo.
echo ----------------------------------------
echo [Attempt 1 Failed] Direct connection timed out.
echo ----------------------------------------
echo.
echo [Attempt 2] Trying CLASH Proxy (Port 7890)...
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
git push -u origin main

if %errorlevel% equ 0 goto SUCCESS

echo.
echo ----------------------------------------
echo [Attempt 2 Failed] Port 7890 not working.
echo ----------------------------------------
echo.
echo [Attempt 3] Trying V2RAY/Other Proxy (Port 10809)...
git config --global http.proxy http://127.0.0.1:10809
git config --global https.proxy http://127.0.0.1:10809
git push -u origin main

if %errorlevel% equ 0 goto SUCCESS

:FAIL
echo.
echo ========================================
echo ALL ATTEMPTS FAILED.
echo ========================================
echo.
echo It seems we cannot connect to GitHub.
echo.
echo Please try the following manually:
echo 1. Open your VPN/Proxy software.
echo 2. Check what "Port" it is using (usually in Settings).
echo 3. Tell the AI assistant: "My proxy port is [number]"
echo.
echo Cleaning up settings...
git config --global --unset http.proxy
git config --global --unset https.proxy
pause
exit /b

:SUCCESS
echo.
echo ========================================
echo [SUCCESS] Uploaded successfully!
echo ========================================
echo.
echo Your settings have been saved. Next time it will be faster.
pause
