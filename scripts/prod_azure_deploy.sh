
az acr login --name governancecvproduction
docker build -f Dockerfile.prod -t frontend .

docker tag frontend:latest governancecvproduction.azurecr.io/frontend/frontend:latest

docker push governancecvproduction.azurecr.io/frontend/frontend:latest

