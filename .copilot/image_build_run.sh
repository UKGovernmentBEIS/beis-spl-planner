#!/usr/bin/env bash

# Exit early if something goes wrong
set -e
npx grunt generate-assets
echo "Static assets generated successfully."

# Add commands below to run inside the container after all the other buildpacks have been applied
