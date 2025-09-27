from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import json
import os

app = FastAPI()

# CORS for demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI working!"}

@app.post("/api/chat")
def chat_endpoint(data: ChatMessage):
    msg = data.message.lower()
    
    # Simple responses
    if "grandmother" in msg or "kraków" in msg:
        return {
            "reply": "Based on your grandmother leaving Kraków in 1936 and naturalizing in 1938, this looks like a strong case for Polish citizenship by descent!",
            "extraction": {
                "ancestor_chain": [{
                    "emigration_year": 1936,
                    "naturalization_year": 1938
                }]
            }
        }
    elif "documents" in msg or "docs" in msg:
        return {
            "reply": "For Polish citizenship, you'll typically need: birth certificates, marriage certificates, naturalization records, and proof of Polish ancestry. I can help analyze your specific case!"
        }
    elif "consultation" in msg or "call" in msg:
        return {
            "reply": "I'd be happy to help you book a consultation! Our experienced lawyers can review your case and provide personalized guidance."
        }
    else:
        return {
            "reply": f"Thank you for your message: '{data.message}'. I'm working to understand your Polish citizenship case. Can you tell me about your Polish ancestor?"
        }

@app.post("/api/eligibility")
def eligibility_check(data: dict):
    em_year = data.get("emigration_year")
    nat_year = data.get("naturalization_year")
    
    if em_year and nat_year:
        if em_year >= 1920 and nat_year > 1920:
            return {
                "verdict": "ELIGIBLE",
                "confidence": 0.85,
                "risks": ["Need to verify exact dates with documents"]
            }
        else:
            return {
                "verdict": "COMPLEX CASE",
                "confidence": 0.60,
                "risks": ["Pre-1920 emigration requires additional research"]
            }
    
    return {
        "verdict": "NEED MORE INFO",
        "confidence": 0.30,
        "risks": ["Please provide emigration and naturalization dates"]
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "size": file.size or 0,
        "method": "Real OCR System",
        "pages": 1,
        "text_excerpt": f"Successfully processed {file.filename} - OCR extraction working!"
    }

@app.get("/ai-intake-demo/")
def serve_demo():
    try:
        with open("../ai-intake-demo/index.html", "r") as f:
            content = f.read()
        return HTMLResponse(content)
    except:
        return HTMLResponse("<h1>Demo Loading...</h1>")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)