#!/usr/bin/env bash

# ==============================================================================
# Picture Book of Wild Life and Plants - Git LFS Auto Push Script
# Tracks binary images (*.jpg, *.png, *.webp, *.pdf) via Git LFS and pushes to GitHub
# ==============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🌿 Campus Picture Book - Git LFS Push Utility${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Check Git & Git LFS installation
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed or not in PATH.${NC}"
    exit 1
fi

if ! command -v git-lfs &> /dev/null; then
    echo -e "${RED}❌ Git LFS is not installed. Please install git-lfs first.${NC}"
    echo -e "   Download from: https://git-lfs.com/"
    exit 1
fi

# 2. Sync species assets before pushing
echo -e "${YELLOW}🔄 Syncing species data & images from content-intake/...${NC}"
if command -v npm &> /dev/null; then
    npm run sync-data || echo -e "${YELLOW}⚠️ sync-data completed with warnings, proceeding...${NC}"
fi

# 3. Initialize Git repository if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing new Git repository...${NC}"
    git init
    git branch -M main
fi

# 4. Initialize and verify Git LFS
echo -e "${YELLOW}⚙️  Configuring Git LFS hooks and tracking...${NC}"
git lfs install

# Ensure .gitattributes tracks media files
git lfs track "*.jpg" "*.jpeg" "*.png" "*.webp" "*.pdf" "*.glb" "content-intake/images/*" "public/species/*" "public/models/*" 2>/dev/null || true

# 5. Stage changes including .gitattributes
echo -e "${YELLOW}📂 Staging files for Git LFS...${NC}"
git add .gitattributes
git add .

# 6. Check for changes to commit
if git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${GREEN}✅ No uncommitted changes found.${NC}"
else
    # Determine commit message
    COMMIT_MSG="$1"
    if [ -z "$COMMIT_MSG" ]; then
        if [ -t 0 ]; then
            read -p "📝 Enter commit message [Default: 'Update wildlife & plant catalog with Git LFS assets']: " INPUT_MSG
            COMMIT_MSG="${INPUT_MSG:-Update wildlife & plant catalog with Git LFS assets}"
        else
            COMMIT_MSG="Update wildlife & plant catalog with Git LFS assets ($(date '+%Y-%m-%d %H:%M:%S'))"
        fi
    fi

    echo -e "${YELLOW}💾 Committing: ${COMMIT_MSG}${NC}"
    git commit -m "$COMMIT_MSG"
fi

# 7. Check Remote Repository
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
    echo -e "${YELLOW}🔗 No remote origin configured yet.${NC}"
    if [ -t 0 ]; then
        read -p "Enter your GitHub repository URL (e.g. https://github.com/username/repo.git): " REPO_INPUT
        if [ -n "$REPO_INPUT" ]; then
            git remote add origin "$REPO_INPUT"
            REMOTE_URL="$REPO_INPUT"
            echo -e "${GREEN}✅ Set remote origin to: $REMOTE_URL${NC}"
        else
            echo -e "${RED}❌ No remote URL provided. Commit created locally. Add a remote with: git remote add origin <url>${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Please configure a remote with: git remote add origin <url>${NC}"
        exit 1
    fi
fi

# 8. Push LFS Objects and Git Commits
CURRENT_BRANCH=$(git branch --show-current || echo "main")
echo -e "${BLUE}🚀 Pushing Git LFS media assets to origin...${NC}"
git lfs push --all origin "$CURRENT_BRANCH" 2>/dev/null || true

echo -e "${BLUE}🚀 Pushing commits to origin/$CURRENT_BRANCH...${NC}"
git push -u origin "$CURRENT_BRANCH"

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 Project successfully pushed to GitHub with Git LFS!${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Next steps for Vercel deployment:"
echo -e "1. Import your repo at https://vercel.com"
echo -e "2. In Vercel Project Settings > Environment Variables, add:"
echo -e "   DATABASE_URL=\"<your_neon_postgres_connection_string>\""
echo -e "3. Deploy!"
