@echo off
setlocal EnableDelayedExpansion

REM ==============================================================================
REM Picture Book of Wild Life and Plants - Git LFS Auto Push Utility (.bat)
REM Tracks binary assets (*.jpg, *.png, *.webp, *.pdf) via Git LFS and pushes to GitHub
REM ==============================================================================

echo ======================================================
echo Campus Picture Book - Git LFS Push Utility (.bat)
echo ======================================================
echo.

REM 1. Check Git and Git LFS installation
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

where git-lfs >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git LFS is not installed.
    echo Please download and install Git LFS from https://git-lfs.com/
    pause
    exit /b 1
)

REM 2. Sync species assets before pushing
echo [1/6] Syncing species data and images from content-intake/...
call npm run sync-data
if %ERRORLEVEL% neq 0 (
    echo [WARN] npm run sync-data completed with warnings, continuing...
)
echo.

REM 3. Initialize Git repository if needed
if not exist ".git" (
    echo [2/6] Initializing new Git repository...
    git init
    git branch -M main
) else (
    echo [2/6] Git repository already initialized.
)
echo.

REM 4. Configure Git LFS and tracking
echo [3/6] Configuring Git LFS hooks and tracking rules...
git lfs install
git lfs track "*.jpg" "*.jpeg" "*.png" "*.webp" "*.pdf" "*.glb" "content-intake/images/*" "public/species/*" "public/models/*" >nul 2>&1
echo.

REM 5. Stage files including .gitattributes
echo [4/6] Staging files for Git LFS...
git add .gitattributes
git add .
echo.

REM 6. Commit changes
echo [5/6] Checking for changes to commit...
git diff-index --quiet HEAD -- >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [INFO] No uncommitted changes detected.
) else (
    set "COMMIT_MSG=%~1"
    if "!COMMIT_MSG!"=="" (
        set /p "COMMIT_MSG=Enter commit message [Press Enter for default]: "
    )
    if "!COMMIT_MSG!"=="" (
        set "COMMIT_MSG=Update wildlife and plant catalog with Git LFS assets"
    )
    echo Committing: "!COMMIT_MSG!"
    git commit -m "!COMMIT_MSG!"
)
echo.

REM 7. Check Remote Repository
echo [6/6] Verifying remote repository...
for /f "tokens=*" %%a in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%a"

if "!REMOTE_URL!"=="" (
    echo [WARN] No remote origin configured yet.
    set /p "REPO_INPUT=Enter your GitHub repository URL (e.g. https://github.com/username/repo.git): "
    if "!REPO_INPUT!"=="" (
        echo [ERROR] No remote URL provided. Commit created locally.
        echo To push manually later, run: git remote add origin ^<url^>
        pause
        exit /b 1
    )
    git remote add origin !REPO_INPUT!
    set "REMOTE_URL=!REPO_INPUT!"
    echo [INFO] Set remote origin to: !REMOTE_URL!
)

REM Get current branch name
for /f "tokens=*" %%b in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%b"
if "!CURRENT_BRANCH!"=="" set "CURRENT_BRANCH=main"

echo.
echo Pushing Git LFS media assets to origin/!CURRENT_BRANCH!...
git lfs push --all origin !CURRENT_BRANCH! >nul 2>&1

echo Pushing commits to origin/!CURRENT_BRANCH!...
git push -u origin !CURRENT_BRANCH!

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================
    echo Project successfully pushed to GitHub with Git LFS!
    echo ======================================================
    echo.
    echo Next steps for Vercel deployment:
    echo 1. Import your repo at https://vercel.com
    echo 2. In Vercel Project Settings - Environment Variables, add:
    echo    DATABASE_URL="^<your_neon_postgres_connection_string^>"
    echo 3. Deploy!
) else (
    echo [ERROR] Git push failed. Please check your credentials or remote URL.
)

echo.
pause
