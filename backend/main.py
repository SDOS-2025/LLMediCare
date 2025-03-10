from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.llms import LlamaCpp
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model path using absolute path (updated for new directory structure)
model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "llama-2-7b-chat.gguf")

# Check if model exists
if not os.path.exists(model_path):
    error_message = f"""
    ERROR: Llama 2 model file not found at {model_path}
    
    Please ensure you:
    1. Download the Llama 2 (7B Chat) model file (llama-2-7b-chat.gguf)
    2. Place it in the 'models' directory
    3. The file should be named exactly: llama-2-7b-chat.gguf
    
    You can download the model from Hugging Face or other official sources.
    """
    print(error_message)
    raise FileNotFoundError(error_message)

# Initialize Llama
try:
    callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    llm = LlamaCpp(
        model_path=model_path,
        temperature=0.5,
        max_tokens=2000,
        top_p=1,
        callback_manager=callback_manager,
        verbose=True,
        n_ctx=2048
    )
except Exception as e:
    error_message = f"""
    Failed to initialize Llama model: {str(e)}
    
    Please ensure:
    1. The model file is not corrupted
    2. You have sufficient RAM (at least 16GB recommended)
    3. Your system meets the minimum requirements
    """
    print(error_message)
    raise RuntimeError(error_message)

# Create the medical analysis prompt template
medical_template = """
You are a medical analysis assistant. Your role is to analyze symptoms and provide helpful medical information.
Please analyze the following symptoms and provide:
1. Possible conditions based on the symptoms
2. General information about these conditions
3. Important precautions or lifestyle recommendations
4. A clear reminder to seek professional medical advice

USER SYMPTOMS: {symptoms}

Please provide your analysis:
"""

prompt = PromptTemplate(
    input_variables=["symptoms"],
    template=medical_template
)

# Create the chain
chain = LLMChain(llm=llm, prompt=prompt)

class SymptomRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "model": "Llama 2 7B Chat",
        "model_path": model_path,
        "model_loaded": True
    }

@app.post("/api/medical-chat")
async def get_medical_response(request: SymptomRequest):
    try:
        response = chain.run(symptoms=request.message)
        return {
            "response": f"{response}\n\n*Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.*"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
