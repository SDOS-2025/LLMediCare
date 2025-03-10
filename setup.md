# LLMediCare Project Setup

## Project Structure
```
LLMediCare/
├── backend/              # FastAPI backend server
│   ├── main.py          # Main FastAPI application
│   └── requirements.txt  # Backend-specific requirements
├── llmedicare/          # Frontend Vue.js application
│   ├── src/             # Source code
│   ├── public/          # Public assets
│   └── package.json     # Frontend dependencies
├── models/              # LLM model files
│   └── llama-2-7b-chat.gguf
└── requirements.txt     # Main project requirements
```

## Setup Instructions

1. Install Python Dependencies:
```bash
pip install -r requirements.txt
```

2. Install Frontend Dependencies:
```bash
cd llmedicare
npm install
```

3. Start the Backend Server:
```bash
cd backend
uvicorn main:app --reload
```

4. Start the Frontend Development Server:
```bash
cd llmedicare
npm run dev
```

## Model Setup
- Place the Llama 2 (7B Chat) model file in the `models/` directory
- Required model: `llama-2-7b-chat.gguf`

## Environment Configuration
- Backend runs on: http://localhost:8000
- Frontend runs on: http://localhost:5174

## Features
- Medical symptom analysis using Llama 2 model
- Real-time chat interface
- Medical-specific prompt templates
- Safety disclaimers and professional advice reminders
