#!/bin/sh
set -eu

MESSAGE="${*:-Update files}"
BRANCH="$(git branch --show-current)"

git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "$MESSAGE"
git push origin "$BRANCH"

echo "Committed and pushed: $MESSAGE"
