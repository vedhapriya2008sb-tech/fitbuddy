# FitBuddy AI - Backend API

The backend for **FitBuddy AI** is built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and the official **Google Gemini AI SDK** (`google-genai`).

## Features
- **JWT Authentication**: Secure user registration, password hashing with direct Bcrypt, and token-based API authentication.
- **SQLAlchemy ORM**: Full relational models with cascading foreign keys for Users, Profiles, Workout Plans, Workout Sessions, and Nutrition Guidance. Compatible with SQLite and PostgreSQL.
- **AI-Powered Plan Generation**: Custom prompt architecture calling Google Gemini API to generate personalized fitness and nutrition plans, with an intelligent fallback engine if offline or if no API key is provided.
- **Workout Activity Tracking**: Log workout sessions, duration, calories burned, and completion status.
- **Dashboard Analytics**: Real-time aggregated stats, consecutive workout streaks, and active routine overview.
- **Full Test Suite**: 20 automated unit and integration tests using Pytest with in-memory database isolation.

## Quick Start (Backend)

### 1. Set Up Virtual Environment
```powershell
# Windows PowerShell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in `backend/` (or copy from `.env.example`):
```env
APP_NAME="FitBuddy AI"
ENVIRONMENT="development"
SECRET_KEY="fitbuddy-local-dev-secret-key-32chars-minimum-hash-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL="sqlite:///./fitbuddy.db"
GEMINI_API_KEY="your-gemini-api-key-here" # Optional: falls back gracefully if blank
GEMINI_MODEL="gemini-2.5-flash"
CORS_ORIGINS="http://localhost:4200,http://127.0.0.1:4200,http://localhost:3000"
```

### 4. Run the Server
```powershell
# From the backend directory
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Swagger UI Documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 5. Run the Tests
```powershell
pytest tests -v
```
