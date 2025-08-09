#!/bin/bash

# Build Next.js application
npm run build

# Start the application with both frontend and sync service
npm start &

# Start blockchain sync service  
npm run sync &

# Keep the container running
wait
