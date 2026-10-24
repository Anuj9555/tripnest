@echo off
setlocal
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%

echo ========================================================
echo     PUSHING TRIPNEST TO GITHUB (Anuj9555/tripnest)
echo ========================================================
echo.
echo Step 1 of 2: Authorizing GitHub in your browser...
echo A one-time code will appear below and your browser will open.
echo Enter the code on GitHub and click "Authorize".
echo.

gh auth login --hostname github.com -p https -w

echo.
echo Step 2 of 2: Pushing code to https://github.com/Anuj9555/tripnest...
echo.

gh auth setup-git
git push -u origin main

echo.
echo ========================================================
echo ALL FILES PUSHED TO GITHUB SUCCESSFULLY!
echo You can now return to Render.com and click "Manual Deploy" or reconnect the repo!
echo ========================================================
echo.
pause
