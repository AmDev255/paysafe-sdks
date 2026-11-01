#!/bin/sh
# Pushes a directory to GitHub as one commit using the alpine/git image. No .git is left in the directory.
# Usage: tools/push-repo.sh <dir> <owner/repo> "<message>"   (env: GITHUB_TOKEN_FILE, GIT_AUTHOR_FILE with "name\nemail")
set -eu
DIR="$1"; REPO="$2"; MSG="$3"
TOKEN="$(tr -d '\r\n' < "$GITHUB_TOKEN_FILE")"
NAME="$(sed -n 1p "$GIT_AUTHOR_FILE" | tr -d '\r')"
EMAIL="$(sed -n 2p "$GIT_AUTHOR_FILE" | tr -d '\r')"
export MSYS_NO_PATHCONV=1
docker run --rm -e "TOKEN=$TOKEN" -e "NAME=$NAME" -e "EMAIL=$EMAIL" -e "MSG=$MSG" -e "REPO=$REPO" -v "$DIR:/work" -w /work --entrypoint sh alpine/git -c '
set -e
export GIT_DIR=/tmp/gitdir GIT_WORK_TREE=/work
git init -q -b main
git config user.name "$NAME"
git config user.email "$EMAIL"
git config core.autocrlf false
git remote add origin "https://x-access-token:${TOKEN}@github.com/${REPO}.git"
git fetch -q origin main 2>/dev/null && git reset -q --soft origin/main || true
git add -A
for f in gradlew mvnw; do [ -f "$f" ] && git update-index --chmod=+x "$f" || true; done
if git diff --cached --quiet; then echo "nothing to commit for $REPO"; exit 0; fi
git -c commit.gpgsign=false commit -q -m "$MSG"
git push -q origin main
echo "pushed $(git rev-parse --short HEAD) to $REPO ($(git ls-files | wc -l) files)"
'
