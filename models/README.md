# Model Setup Instructions

## Required Model
- Name: `llama-2-7b-chat.gguf`
- Size: ~4GB
- Format: GGUF (GPT-Generated Unified Format)
- Version: Llama 2 7B Chat

## Download Instructions

1. Download from Hugging Face:
   - Visit: https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
   - Download the file: `llama-2-7b-chat.gguf`

2. Place the Model:
   - Put the downloaded file in this directory (`LLMediCare/models/`)
   - Ensure the filename is exactly: `llama-2-7b-chat.gguf`

## System Requirements
- RAM: Minimum 16GB recommended
- Storage: At least 5GB free space
- CPU: Modern multi-core processor
- Python with llama-cpp-python package installed

## Verification
After placing the model:
1. Start the backend server
2. Visit http://localhost:8000
3. You should see a health check response confirming the model is loaded

## Troubleshooting
If you encounter errors:
1. Verify the exact filename matches: `llama-2-7b-chat.gguf`
2. Ensure you have sufficient RAM available
3. Check that the model file is not corrupted
4. Verify all Python dependencies are installed
