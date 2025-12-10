# az acr login --name governancecvproduction

# docker build -f Dockerfile -t partner_portal .

# docker tag partner_portal:latest governancecvproduction.azurecr.io/partner_portal/partner_portal:latest

# docker push governancecvproduction.azurecr.io/partner_portal/partner_portal:latest

#!/bin/bash
set -e

# ============================================
# Azure ACR Build and Push Script
# Compatible with both x86 and ARM hosts
# Builds for amd64 (x86_64) by default
# ============================================

# ---- CONFIGURATION ----
ACR_NAME="governancecvproduction"                # Your Azure Container Registry name
IMAGE_NAME="partner_portal"                       # Your app image name
IMAGE_TAG="latest"                            # Tag for the image (use git commit hash in CI if needed)
DOCKERFILE="Dockerfile"                   # Dockerfile to use
PLATFORM="linux/amd64"                        # Target platform for AKS cluster
MULTI_ARCH=false                              # Set to true if you want both amd64 and arm64 builds

# ---- derived ----
ACR_SERVER="${ACR_NAME}.azurecr.io"
FULL="${ACR_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "🔐 Logging into ACR: $ACR_NAME"
az acr login --name "$ACR_NAME"

# ensure buildx is available and use a container-backed builder (safe)
docker buildx create --name mac-builder --driver docker-container --use 2>/dev/null || docker buildx use mac-builder

echo "🏗 Building for linux/amd64 and pushing to $FULL"
docker buildx build \
  --platform linux/amd64 \
  -f "$DOCKERFILE" \
  -t "$FULL" \
  --push \
  .

echo "✅ Pushed: $FULL"

