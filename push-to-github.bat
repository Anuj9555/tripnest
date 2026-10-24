@echo off
setlocal
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%

echo ========================================================
echo         TRIPNEST: GITHUB REPOSITORY SETUP
echo ========================================================
echo.
echo Step 1: Logging in to GitHub...
echo A one-time code will appear below and your browser will open.
echo Enter the code on GitHub and click "Authorize".
echo.

gh auth login --hostname github.com -p https -w

echo.
echo ========================================================
echo Step 2: Creating GitHub repository "tripnest" and pushing...
echo ========================================================
echo.

gh repo create tripnest --public --source=. --remote=origin --push

echo.
echo ========================================================
echo SUCCESS! Your TripNest repository is live on GitHub!
echo ========================================================
echo.
pause
