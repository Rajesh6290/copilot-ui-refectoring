az acr login --name governancecvfrontend
docker build -f Dockerfile.dev -t frontend-v2-default .
docker tag frontend-v2-default:latest governancecvfrontend.azurecr.io/frontend-v2-default:latest
docker push governancecvfrontend.azurecr.io/frontend-v2-default:latest


# az acr login --name governancecvbackend

# docker build -t co-pilot-platfrom-default .

# docker tag co-pilot-platfrom-default:latest governancecvbackend.azurecr.io/co-pilot-platfrom-default:latest

# docker push governancecvbackend.azurecr.io/co-pilot-platfrom-default:latest
