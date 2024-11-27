#!/bin/bash

# Define paths to the scripts
INDEX_SCRIPT="index.js"
CONTROLLER_SCRIPT="controller.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it to proceed."
    exit 1
fi

# Function to run a script
run_script() {
    SCRIPT=$1
    echo "Running $SCRIPT..."
    if node "$SCRIPT"; then
        echo "$SCRIPT ran successfully!"
    else
        echo "Error running $SCRIPT. Exiting."
        exit 1
    fi
}

# Execute the scripts sequentially
run_script $INDEX_SCRIPT
run_script $CONTROLLER_SCRIPT

echo "All scripts executed successfully!"
