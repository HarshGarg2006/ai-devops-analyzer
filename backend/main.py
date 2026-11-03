from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from routers.auth import router as auth_router
from routers.logs import router as logs_router


app = FastAPI(
    title="LogAI API",
    description="AI-Based DevOps Log Analyzer Backend API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Authentication APIs
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)


# Log Analysis APIs
app.include_router(logs_router)


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "LogAI Backend API is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}