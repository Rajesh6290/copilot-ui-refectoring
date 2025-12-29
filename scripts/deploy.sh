aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 705814663230.dkr.ecr.us-east-2.amazonaws.com
docker build -t frontend-v2-default .
docker tag frontend-v2-default:latest 705814663230.dkr.ecr.us-east-2.amazonaws.com/frontend-v2-default:latest
docker push 705814663230.dkr.ecr.us-east-2.amazonaws.com/frontend-v2-default:latest