#!/bin/bash
# Post-create hook for devcontainer
# Sets up git configuration and builds the project

set -e

echo "=== Setting up development environment ==="

# ---- Git Configuration ----
# Ensure git does NOT cache credentials in the container
# Credentials should be delegated to the host's VSCode credential manager
git config --global credential.helper ""
# Use VSCode's built-in credential helper when available
git config --global --unset-all credential.helper 2>/dev/null || true

echo "Git configured to use host credential delegation"

# ---- Build Project ----
echo "Building server..."
npm run build-server

echo "=== Development environment ready ==="
echo "Git credentials will be delegated to your host machine."
echo "Ensure you have configured git credentials on your host before pushing."
