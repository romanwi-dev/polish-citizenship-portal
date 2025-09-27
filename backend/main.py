import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# CORS: permissive for testing; can tighten later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
HERE = os.path.dirname(__file__)
FRONTEND_DIR = os.path.abspath(os.path.join(HERE, "..", "frontend"))

# Serve all static assets from /assets
if os.path.isdir(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

# Root: if precheck exists, serve it at /precheck; keep / for existing index if present, else fallback to precheck
@app.get("/")
def root():
    idx = os.path.join(FRONTEND_DIR, "index.html")
    pre = os.path.join(FRONTEND_DIR, "precheck.html")
    if os.path.exists(idx):
        return FileResponse(idx)
    elif os.path.exists(pre):
        return FileResponse(pre)
    return {"message": "Frontend not found. Visit /precheck after we create it."}

@app.get("/precheck")
def precheck_page():
    pre = os.path.join(FRONTEND_DIR, "precheck.html")
    if os.path.exists(pre):
        return FileResponse(pre)
    return {"message": "precheck.html not found yet."}

if __name__ == "__main__":
    import uvicorn
    port = 8000  # Use port 8000 explicitly
    uvicorn.run(app, host="0.0.0.0", port=port)