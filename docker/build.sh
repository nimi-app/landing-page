#!/bin/bash

# Extract build information from git
GIT_COMMIT=$(git rev-parse HEAD)
GIT_TAG=$(git tag --points-at HEAD)
GIT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD | sed 's/[^a-zA-Z0-9]/-/g')

# Initial docker image info
DOCKER_IMAGE_NAME="nimi-landing-page"
DOCKER_IMAGE_VERSION=$(echo $GIT_TAG | sed 's/v//g')

# Use tag if exists, resort to branch name
GIT_REVISION=$GIT_TAG

if [ !$GIT_TAG ]
then
    GIT_REVISION=$GIT_BRANCH_NAME
    DOCKER_IMAGE_VERSION=$GIT_BRANCH_NAME
elif [ !$GIT_BRANCH_NAME ]
then
    GIT_REVISION=$GIT_COMMIT
    DOCKER_IMAGE_VERSION=$GIT_COMMIT
fi

# Construct Docker image
# Final image name is in the form of <image_name>:<image_version>
DOCKER_IMAGE_TAG="${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}"
# Build Docker image
echo "Building ${DOCKER_IMAGE_TAG} @ ${GIT_COMMIT} from ${GIT_REVISION}"

docker build --file ./docker/Dockerfile \
--build-arg "GIT_COMMIT=${GIT_COMMIT}" \
--build-arg "GIT_REVISION=${GIT_REVISION}" \
--tag ${DOCKER_IMAGE_TAG} .