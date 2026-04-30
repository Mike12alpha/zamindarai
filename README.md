# ZamindarAI v2.0

**AI-powered agricultural protection system for Pakistani farmers.**

> ZamindarAI acts as a digital guardian ("Muhaafiz") for smallholder farmers in Pakistan. It combines 4 specialized AI agents into a single "Kisan Council" accessible via a modern web interface — in both **English** and **proper Urdu (اردو)**.

---

## What's New in v2.0

- **Next.js 16 Frontend**: Modern, interactive, responsive UI with Framer Motion animations
- **Full Authentication**: JWT-based signup/login with bcrypt password hashing
- **Real-time Market Scraping**: Live price data from Pakistan agricultural sources with intelligent fallback
- **Proper Urdu Support**: Full UI in Urdu script (اردو), not Roman Urdu — with RTL layout
- **Real Generative AI**: All agents use Gemini 1.5 Flash/Pro for genuine, non-hardcoded responses
- **Multi-language Agent Responses**: Agents respond in English or Urdu based on user preference

---

## Architecture

```
Farmer (Web Browser)
         ↓
   Next.js 16 Frontend (React, Tailwind, i18n)
         ↓
   FastAPI Backend (Python)
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
CropDoctor  PriceOracle  SoilAdvisor  DealGuardian
    ↓         ↓        ↓        ↓
Gemini    Scraper+RAG  RAG KB    Contract
Vision    (real-time)  (soil)    PDF + QR
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, SQLAlchemy, SQLite |
| **Auth** | JWT tokens, bcrypt password hashing |
| **AI/ML** | Google Gemini 1.5 Flash/Pro (vision + text) |
| **Vector DB** | ChromaDB (crop diseases, soil guides, mandi prices) |
| **Scraper** | BeautifulSoup + requests (real-time Pakistan agri prices) |
| **i18n** | Custom context-based translations (English / Urdu) |
| **Documents** | ReportLab (PDF), QRCode (verification) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- Windows / macOS / Linux

### 1. Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env and add your API keys:
# GOOGLE_API_KEY=your-gemini-api-key
# APP_SECRET_KEY=your-jwt-secret
```

### 2. Start Backend

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate   # macOS/Linux

$env:PYTHONPATH="."
.\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for Swagger UI.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) for the web interface.

---

## Features

### 🔐 Authentication
- Secure signup/login with email and password
- JWT token-based session management
- Protected API routes

### 🧠 AI Agents (Real Generative Responses)
All agents use Google Gemini API for genuine, context-aware responses:

| Agent | Role | What it does |
|-------|------|-------------|
| **Dr. Zarai** (Crop Doctor) | 🩺 Agronomist | Diagnoses crop diseases from photos using Gemini Vision |
| **MandiMaster** (Price Oracle) | 💰 Economist | Checks real-time mandi rates against buyer offers |
| **ZaminExpert** (Soil Advisor) | 🌱 Soil Scientist | Recommends exact fertilizers based on soil and crop |
| **Muhaafiz** (Deal Guardian) | 📜 Lawyer | Generates tamper-proof sale contracts with QR verification |

### 🌐 Multi-Language
- Toggle between **English** and **Urdu (اردو)**
- Full RTL support for Urdu
- Agent responses adapt to selected language

### 📊 Real-Time Market Rates
- Scrapes live prices from Pakistan agricultural sources
- Intelligent fallback to baseline market data if scraping fails
- Prices update dynamically for each price check

### 🖼️ Modern UI
- Responsive dashboard with sidebar navigation
- Animated transitions with Framer Motion
- Interactive chat interface for Kisan Council
- Clean, accessible design with Tailwind CSS

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create new account |
| `/auth/login` | POST | Login and get JWT token |
| `/auth/me` | GET | Get current user profile |
| `/diagnoses/` | POST | Upload crop photo for diagnosis |
| `/prices/check` | POST | Check if offered price is fair |
| `/contracts/generate` | POST | Generate sale contract |
| `/soil/advise` | POST | Get soil/fertilizer advice |
| `/council/chat` | POST | Kisan Council chat with AI agents |
| `/health` | GET | Health check |

---

## Project Structure

```
zamindarai/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── auth.py            # JWT & bcrypt auth
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # DB engine & session
│   │   └── routers/
│   │       ├── auth.py        # Login/signup
│   │       ├── diagnoses.py   # Crop doctor API
│   │       ├── prices.py      # Price oracle API
│   │       ├── contracts.py   # Deal guardian API
│   │       ├── soil.py        # Soil advisor API
│   │       ├── council.py     # Kisan Council API
│   │       └── impact.py      # Dashboard stats
│   ├── agents/
│   │   ├── base.py            # Base agent with Gemini
│   │   ├── crop_doctor.py     # Vision + treatment
│   │   ├── price_oracle.py    # Live scraper + analysis
│   │   ├── soil_advisor.py    # Soil recommendations
│   │   └── deal_guardian.py   # Contract generation
│   ├── core/
│   │   ├── scraper.py         # Real-time price scraper
│   │   ├── vector_store.py    # ChromaDB knowledge base
│   │   ├── contract_pdf.py    # PDF + QR generator
│   │   └── i18n.py            # Urdu/English prompts
│   └── requirements.txt
├── frontend/
│   ├── app/[locale]/          # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── login/page.tsx     # Login
│   │   ├── register/page.tsx  # Signup
│   │   └── dashboard/         # Agent dashboards
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/Sidebar.tsx
│   │   └── I18nProvider.tsx   # Translation context
│   ├── messages/
│   │   ├── en.json            # English translations
│   │   └── ur.json            # Urdu translations
│   └── package.json
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key |
| `APP_SECRET_KEY` | Yes | JWT secret key |
| `DATABASE_URL` | No | Defaults to SQLite |
| `HF_TOKEN` | No | HuggingFace token |
| `SERPAPI_KEY` | No | SerpAPI for web search |

---

## License

MIT

---

Built for Pakistani farmers. Kisaan ka digital muhaafiz.
