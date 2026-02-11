@echo off
set "PATH=%PATH%;C:\Program Files\Git\cmd"

echo ----------------------------------------
echo Number Bridge - GitHub Publisher
echo ----------------------------------------

REM Check if .git exists
if not exist .git (
    echo [INFO] Initializing new Git repository...
    git init
)

echo [INFO] Adding files...
git add .

echo [INFO] Committing changes...
git commit -m "Auto-update from Trae"

echo [INFO] Configuring branch...
git branch -M main

echo [INFO] Configuring remote...
REM Try to add remote, suppress error if it exists
git remote add origin https://github.com/analogbull/number-bridge.git 2>nul
REM Ensure URL is correct just in case
git remote set-url origin https://github.com/analogbull/number-bridge.git

echo.
echo [ACTION] Pushing to GitHub...
echo.
echo ********************************************************
echo * ATTENTION: A GitHub login window may pop up now.     *
echo * Please check your taskbar if you don't see it!       *
echo ********************************************************
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Upload complete!
) else (
    echo.
    echo [ERROR] Upload failed. Please check the error message above.
)

echo.
pause
