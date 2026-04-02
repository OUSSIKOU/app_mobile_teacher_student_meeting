#!/bin/bash

echo "Starting Easy Study Development Environment..."
echo ""

echo "Make sure MongoDB is running before proceeding..."
echo ""

echo "Starting Backend Server..."
cd server
npm run dev &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 3

echo "Starting Frontend Client..."
cd ../client
npm start &
CLIENT_PID=$!

echo ""
echo "Both server and client are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: Follow Expo CLI instructions"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to stop the services
wait $SERVER_PID $CLIENT_PID
