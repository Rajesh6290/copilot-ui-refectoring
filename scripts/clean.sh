 #!/usr/bin/env bash

echo "🧹 Cleaning started..."

# Function to remove a file or directory if it exists
remove_if_exists() {
    if [ -e "$1" ]; then
        echo "Removing $1..."
        rm -rf "$1"
    fi
}

# Remove node_modules, .next, and lock files if they exist
remove_if_exists "node_modules"
remove_if_exists ".next"
remove_if_exists "package-lock.json"
remove_if_exists "pnpm-lock.yaml"
remove_if_exists "yarn.lock"

echo "✅ Cleanup finished."