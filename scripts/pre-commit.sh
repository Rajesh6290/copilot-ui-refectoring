#!/usr/bin/env bash

# Pre-commit Hook for Code Quality and Naming Convention Checks
# Created by Chandan
#
# This script performs the following tasks before allowing a commit:
# 1. Checks naming conventions for directories (enforces kebab-case)
# 2. Checks naming conventions for files:
#    - React components (tsx, jsx) must be in PascalCase, except for index.tsx and index.jsx
#    - JavaScript/TypeScript files (js, ts) must be in camelCase
# 3. Runs Prettier for code formatting
# 4. Runs ESLint for linting errors and auto-fixes them
# 5. Runs full TypeScript check using npm run build
#
# If any issues are found, the commit is blocked until they are fixed.

# Colors for better output
RED='\033[1;91m'     # Bright Red
GREEN='\033[1;92m'   # Bright Green
YELLOW='\033[1;93m'  # Bright Yellow
BLUE='\033[1;94m'    # Bright Blue
MAGENTA='\033[1;95m' # Bright Magenta
CYAN='\033[1;96m'    # Bright Cyan
WHITE='\033[1;97m'   # Bright White
NC='\033[0m'         # No Color

# Get all staged files
all_files=$(git diff --cached --name-only --diff-filter=ACM)

# Get staged JS/TS/TSX/JSX files
jsfiles=$(echo "$all_files" | grep -E '\.(js|ts|tsx|jsx)$')

# Get staged TS/TSX files
tsfiles=$(echo "$all_files" | grep -E '\.(ts|tsx)$')

# Exit if no files are staged
if [ -z "$all_files" ]; then
    exit 0
fi

# Check naming conventions for folders and files
echo -e "\n${MAGENTA}📋 Checking naming conventions...${NC}\n"
naming_errors=0

# Collect all unique directories from staged files
directories=$(dirname $(echo "$all_files") | sort -u)

# Check directory names
for dir in $directories; do
    # Skip root directory
    if [ "$dir" = "." ]; then
        continue
    fi

    # Check if directory name contains uppercase letters
    if echo "$dir" | grep -q "[A-Z]"; then
        echo -e "${RED}❌ ERROR: Directory '$dir' contains uppercase letters. Use lowercase.${NC}"
        naming_errors=$((naming_errors + 1))
    fi

    # Check if directory name follows kebab-case (lowercase with hyphens)
    if echo "$dir" | grep -q "[^a-z0-9/.-]"; then
        echo -e "${RED}❌ ERROR: Directory '$dir' is not in kebab-case. Use lowercase with hyphens.${NC}"
        naming_errors=$((naming_errors + 1))
    fi

    # Check for underscores in directory names (not allowed in kebab-case)
    if echo "$dir" | grep -q "_"; then
        echo -e "${RED}❌ ERROR: Directory '$dir' contains underscores. Use hyphens instead for kebab-case.${NC}"
        naming_errors=$((naming_errors + 1))
    fi
done

# Only check file naming conventions for JS/TS/JSX/TSX files
for file in $jsfiles; do
    # Extract filename without extension
    filename=$(basename "$file")
    filename_without_ext="${filename%.*}"
    extension="${filename##*.}"

    # Allow index.tsx and index.jsx
    if [[ "$filename" == "index.tsx" || "$filename" == "index.jsx" ]]; then
        continue
    fi

    # Special case for React component files (should be PascalCase)
    if [[ "$extension" == "jsx" || "$extension" == "tsx" ]]; then
        # Check if component filename follows PascalCase
        if ! echo "$filename_without_ext" | grep -q "^[A-Z][a-zA-Z0-9]*$"; then
            echo -e "${RED}❌ ERROR: React component '$file' should use PascalCase (e.g., ComponentName.tsx).${NC}"
            naming_errors=$((naming_errors + 1))
        fi
    # For non-component JS/TS files, enforce camelCase
    elif [[ "$extension" == "js" || "$extension" == "ts" ]]; then
        # Check if file starts with uppercase or contains underscore or hyphen
        if echo "$filename_without_ext" | grep -q -E "^[A-Z]|_|-"; then
            echo -e "${RED}❌ ERROR: File '$file' should use camelCase (e.g., fileName.js).${NC}"
            naming_errors=$((naming_errors + 1))
        fi
    fi
done

if [ $naming_errors -gt 0 ]; then
    echo -e "\n${RED}❌ ERROR: Found $naming_errors naming convention issues. Please fix before committing.${NC}\n"
    exit 1
fi

# Skip linting and TypeScript checks if no JS/TS/TSX files are staged
if [ -z "$jsfiles" ]; then
    echo -e "\n${YELLOW}⚠️ No JS/TS/TSX files staged, skipping lint and TypeScript checks.${NC}\n"
    exit 0
fi

# Run Prettier on staged files
echo -e "\n${CYAN}💅 Running Prettier on staged files:${NC}"
echo -e "${YELLOW}$jsfiles${NC}\n"

if ! node_modules/.bin/prettier --write $jsfiles; then
    echo -e "\n${RED}❌ ERROR: Prettier failed. Check your Prettier configuration.${NC}\n"
    exit 1
fi

# After Prettier, stage the formatted files
echo -e "\n${GREEN}✨ Prettier formatting complete. Adding formatted files to staging area.${NC}\n"
git add $jsfiles

# Run ESLint on staged files
echo -e "\n${BLUE}🔍 Running ESLint on staged files:${NC}"
echo -e "${YELLOW}$jsfiles${NC}\n"

if ! node_modules/.bin/eslint --quiet --fix $jsfiles; then
    echo -e "\n${RED}❌ ERROR: ESLint issues found. Fix them before committing.${NC}\n"
    exit 1
fi

# Skip TypeScript checking if no TypeScript files are staged
if [ -z "$tsfiles" ]; then
    echo -e "\n${YELLOW}⚠️ No TypeScript files staged, skipping TypeScript checks.${NC}\n"
    exit 0
fi

# Run full TypeScript type checking
if [ -n "$tsfiles" ]; then
    echo -e "\n${CYAN}🔍 TypeScript files detected. Running full TypeScript check...${NC}"
    echo -e "${YELLOW}This may take a moment but ensures type safety.${NC}\n"

    # Run TypeScript build process
    if ! npm run build; then
        echo -e "\n${RED}❌ ERROR: TypeScript errors detected. Fix them before committing.${NC}\n"
        exit 1
    fi

    echo -e "\n${GREEN}✅ TypeScript check passed!${NC}\n"
fi

echo -e "\n${GREEN}🎉 All checks passed! Ready to commit!${NC}\n"
exit 0
