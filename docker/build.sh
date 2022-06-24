#!/bin/bash

# Extract build information from git
GIT_COMMIT=$(git rev-parse HEAD)
GIT_TAG_NAME=$(git tag --points-at HEAD)
GIT_BRANCH_NAME=$(git branch --show-current)

# Use tag if exists, resort to branch name
GIT_REVISION=$GIT_TAG

if [ "${GIT_TAG}" == "" ]; then
    GIT_REVISION=$GIT_BRANCH_NAME
fi

# Construct Docker image
# DOCKER_TAG=$GIT_REVISION
DOCKER_IMAGE_NAME="nimi-landing-page"
DOCKER_IMAGE="${DOCKER_IMAGE_NAME}"

echo "Building ${DOCKER_IMAGE} @ ${GIT_COMMIT}"

docker build --file ./docker/Dockerfile -t ${DOCKER_IMAGE} --build-arg "GIT_COMMIT=${GIT_COMMIT}" --build-arg "GIT_REVISION=${GIT_REVISION}" .