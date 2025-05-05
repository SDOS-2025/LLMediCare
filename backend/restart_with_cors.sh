#!/bin/bash

echo "Checking CORS configuration..."
python cors_check.py

echo ""
echo "Restarting Django server..."
echo "Make sure all requests from frontend to backend use the full ngrok URL:"
echo "https://b574-2405-201-4018-6162-1c04-5bae-f2aa-34b.ngrok-free.app"
echo ""

# Restart the Django server
python manage.py runserver 0.0.0.0:8000 