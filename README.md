# FitBuddy AI – AI-Powered Fitness & Nutrition Plan Generator

FitBuddy AI is a modern full-stack web application that generates personalized workout and nutrition plans tailored to an individual's profile, fitness goals, and physical questionnaire data. Powered by **FastAPI** with **SQLAlchemy ORM** on the backend and **Angular standalone components** with **TypeScript** on the frontend, it features intelligent **Google Gemini AI** plan generation with a graceful offline/fallback engine.

---

## 🌟 Architecture & Tech Stack

```
                          ┌────────────────────────┐
                          │   Angular 19+ (SPA)    │
                          │  TypeScript / Forms    │
                          │   Port 4200 (Vite/Ng)  │
                          └───────────┬────────────┘
                                      │ HTTP / REST (JWT Auth)
                                      ▼
                          ┌────────────────────────┐
                          │   FastAPI Backend      │
                          │   Python 3.14 / Pydantic│
                          │   Port 8000 (Uvicorn)  │
                          └──────┬──────────┬──────┘
                                 │          │
                     SQLAlchemy  │          │ Google GenAI SDK
                                 ▼          ▼
                      ┌───────────────┐  ┌───────────────────┐
                      │ SQLite / PG   │  │  Google Gemini    │
                      │ (fitbuddy.db) │  │  (gemini-2.5-flash│
                      └───────────────┘  └───────────────────┘
```

### **Frontend**
- **Framework**: Angular 19+ (Standalone Components, No NgModules)
- **Language**: TypeScript 5.9+
- **Styling**: Modern CSS3 (Dark/Light vibrant fitness theme, glassmorphic cards, responsive mobile/tablet layout)
- **Routing**: Angular Router with functional `authGuard`
- **Forms**: Angular Reactive Forms with comprehensive validation
- **State & HTTP**: Signals & RxJS with JWT Bearer HTTP Interceptor

### **Backend**
- **Framework**: FastAPI (Python 3)
- **ORM & Database**: SQLAlchemy 2.0+ with SQLite (production-ready for PostgreSQL)
- **Data Validation**: Pydantic v2 schemas
- **Security**: JWT Bearer tokens with Bcrypt password hashing
- **Testing**: Pytest test suite with in-memory SQLite isolation

### **AI Engine**
- **SDK**: Official Google GenAI SDK (`google-genai`)
- **Model**: `gemini-2.5-flash`
- **Reliability**: Structured JSON extraction with fallback generation engine for offline operation or when API keys are not supplied.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10+ (Tested with Python 3.14)
- **Node.js**: 20+ (Tested with Node v24.21.0 & npm 11.19.0)

---

### 2. Backend Setup & Run

Open a terminal in the project root:

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment if not already present
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **API Documentation**:
> - Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
> - ReDoc Alternative: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 3. Frontend Setup & Run

Open a second terminal in the project root:

```powershell
# Navigate to frontend directory
cd frontend

# Install packages (already installed)
npm install

# Start the Angular development server
cmd /c "npm start"
# or npx ng serve
```

> **Web App URL**: [http://localhost:4200](http://localhost:4200)

---

## 🧪 Automated Testing

### Backend Test Suite
FitBuddy AI comes with 20 automated unit and integration tests covering:
- User registration, duplicate checks, validation, and login authentication.
- Profile creation, updates, and authorization guards.
- Fitness plan generation, retrieval, activation, and user data isolation.
- Workout session logging, streak calculation, and metrics updates.
- Real-time dashboard analytics aggregation.

To run the backend test suite:
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

### Frontend Build Verification
To compile and verify the Angular production bundle:
```powershell
cd frontend
cmd /c "npm run build"
```

---

## 📂 Project Directory Structure

```
vethapriya/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration, security, JWT utilities
│   │   ├── models/         # SQLAlchemy ORM models (User, Profile, Plan, Session)
│   │   ├── routers/        # FastAPI endpoints (auth, users, fitness, workouts, dashboard)
│   │   ├── schemas/        # Pydantic v2 request/response schemas
│   │   ├── services/       # Gemini AI service and fallback generator
│   │   ├── database.py     # Database engine, session maker, init_db
│   │   └── main.py         # FastAPI app factory, CORS, lifespan handler
│   ├── tests/              # 20 Pytest automated tests
│   ├── .env                # Backend environment configuration
│   ├── .env.example        # Environment template
│   └── requirements.txt    # Python package dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Navigation bar, footer, shared UI components
│   │   │   ├── guards/     # Angular functional authGuard
│   │   │   ├── interceptors/# HTTP Bearer token interceptor
│   │   │   ├── models/     # TypeScript interfaces and types
│   │   │   ├── pages/      # Route pages (Home, Login, Register, Profile,
│   │   │   │               # Questionnaire, Plan Generation, Plan Details,
│   │   │   │               # Workout History, Dashboard)
│   │   │   ├── services/   # Auth, Profile, Fitness, Workout, Dashboard API services
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts# Lazy-loaded route configuration
│   │   ├── styles.css      # Core design tokens, gradients, badges, layout utilities
│   │   └── index.html      # App entry point
│   ├── angular.json        # Angular CLI configuration
│   ├── package.json        # Frontend scripts and dependencies
│   └── tsconfig.json       # TypeScript compiler settings
│
└── README.md               # Master project documentation
```

---

## 🔑 Environment Configuration

The backend `.env` file (`backend/.env`) provides standard configuration:

| Variable | Description | Default |
|---|---|---|
| `APP_NAME` | Name displayed in docs | `FitBuddy AI` |
| `ENVIRONMENT` | Runtime environment | `development` |
| `SECRET_KEY` | JWT signing secret | 32+ char secure key |
| `ALGORITHM` | JWT hashing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session token lifespan | `1440` (24h) |
| `DATABASE_URL` | Database connection string | `sqlite:///./fitbuddy.db` |
| `GEMINI_API_KEY` | Optional Google Gemini Key | `your-gemini-api-key-here` |
| `GEMINI_MODEL` | Gemini AI model identifier | `gemini-2.5-flash` |
| `CORS_ORIGINS` | Permitted origins | `http://localhost:4200,...` |

*Note: If no `GEMINI_API_KEY` is provided, the backend seamlessly switches to its built-in rule-based fallback generator, guaranteeing 100% operational functionality in offline or test environments.*
