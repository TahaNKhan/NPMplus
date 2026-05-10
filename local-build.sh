#!/bin/bash

# Helper script for local testing

docker compose down && \
  docker rmi -f zoeyvid/npmplus:latest && \
  docker build -t docker.io/zoeyvid/npmplus:latest . && \
  docker compose up -d && \
  echo "Waiting for container to start..." && \
  sleep 2 && \
  docker logs npmplus -f 
