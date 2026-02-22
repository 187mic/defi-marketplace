#!/usr/bin/env bash
# Script to install the pre-commit hook for secret detection
# Run this after cloning the repository: ./install-hooks.sh

set -e

HOOK_SOURCE=".github/pre-commit-hook-template"
HOOK_DEST=".git/hooks/pre-commit"

echo "Installing pre-commit hook for secret detection..."

if [ ! -d ".git" ]; then
  echo "❌ Error: Not in a git repository"
  echo "Please run this script from the root of the repository"
  exit 1
fi

if [ ! -f "$HOOK_SOURCE" ]; then
  echo "❌ Error: Hook template not found at $HOOK_SOURCE"
  exit 1
fi

# Backup existing hook if present
if [ -f "$HOOK_DEST" ]; then
  echo "📋 Backing up existing pre-commit hook to $HOOK_DEST.backup"
  cp "$HOOK_DEST" "$HOOK_DEST.backup"
fi

# Copy and make executable
cp "$HOOK_SOURCE" "$HOOK_DEST"
chmod +x "$HOOK_DEST"

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now check for:"
echo "  • .env files being committed"
echo "  • Hardcoded API keys and secrets"
echo "  • Private keys"
echo "  • Local email addresses"
echo ""
echo "To test it, try: git commit --allow-empty -m 'test'"
