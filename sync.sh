#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get commit message from argument or prompt user
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
    read -r -p "Enter commit message: " MESSAGE
fi

if [ -z "$MESSAGE" ]; then
    echo -e "\033[0;31mError: Commit message cannot be empty.\033[0m"
    exit 1
fi

echo -e "\033[0;36m=== 1. Pulling latest changes ===\033[0m"
git pull

echo -e "\n\033[0;36m=== 2. Staging all changes ===\033[0m"
git add -A

echo -e "\n\033[0;36m=== 3. Checking status & committing ===\033[0m"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "\033[0;33mNo changes detected to commit.\033[0m"
else
    git commit -m "$MESSAGE"
fi

echo -e "\n\033[0;36m=== 4. Pushing to remote repository ===\033[0m"
git push

echo -e "\n\033[0;32m Successfully pulled, committed, and pushed!\033[0m"
