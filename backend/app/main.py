"""FitBuddy AI - FastAPI Main Application Entrypoint."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database import init_db
from app.routers import auth, dashboard, fitness, users, workouts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("fitbuddy")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables on startup."""
    logger.info("Initializing FitBuddy AI Database...")
    init_db()
    logger.info("Database tables initialized successfully.")
    yield
    logger.info("FitBuddy AI Application shutdown.")


app = FastAPI(
    title="FitBuddy AI – AI-Powered Fitness Plan Generator API",
    description=(
        "Full-stack fitness application backend powered by FastAPI, SQLAlchemy ORM, "
        "and Google Gemini AI. Features user authentication, personalized workout & nutrition generation, "
        "activity tracking, and fitness dashboard analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.cors_origins
if not origins:
    origins = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(fitness.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    """Root health check and welcoming message."""
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
    }


# Centralized exception handler for unexpected server errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled error processing request {request.method} {request.url}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later."
        },
    )
