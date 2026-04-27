# ZamindarAI

**AI-powered agricultural protection system for Pakistani farmers.**

> ZamindarAI acts as a digital guardian ("Muhaafiz") for smallholder farmers in Pakistan. It combines 4 specialized AI agents into a single "Kisan Council" that farmers can reach via WhatsApp, voice, or a simple web interface — all in Roman Urdu.

---

## The Problem

- **80% of Pakistani farmers are smallholders** who sell crops to middlemen ("aartis") at exploitative prices
- **No price transparency**: Farmers don't know the true mandi (market) rate
- **Crop diseases go untreated**: No access to agronomists in remote villages
- **Verbal contracts are broken**: No written proof of sale agreements
- **No digital record**: Every season, farmers start from scratch

## The Solution: Kisan Council

Instead of making farmers navigate apps, ZamindarAI brings together 4 AI experts into one conversational interface:

| Agent | Role | What it does |
|-------|------|-------------|
| **Dr. Zarai** (Crop Doctor) | 🩺 Agronomist | Diagnoses crop diseases from photos, prescribes exact pesticides with dosage per acre |
| **MandiMaster** (Price Oracle) | 💰 Economist | Checks if the buyer's offer matches real mandi rates, calculates losses |
| **ZaminExpert** (Soil Advisor) | 🌱 Soil Scientist | Recommends exact fertilizers (Sona Urea, Engro DAP) based on soil and crop |
| **Muhaafiz** (Deal Guardian) | 📜 Lawyer | Generates tamper-proof sale contracts with QR verification |

## Architecture

```
Farmer (WhatsApp / Voice / Web)
         ↓
   Kisan Council Orchestrator
    (intent routing + synthesis)
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
CropDoctor  PriceOracle  SoilAdvisor  DealGuardian
    ↓         ↓        ↓        ↓
  Vision    RAG KB     RAG KB    Contract
  Model    (mandi)   (soil)     PDF + QR
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy, SQLite |
| **AI/ML** | LangChain, OpenAI GPT, HuggingFace (embeddings + vision) |
| **Vector DB** | ChromaDB (crop diseases, soil guides, mandi prices) |
| **Scheduler** | APScheduler (live price updates every 6 hours) |
| **Frontend** | Streamlit (web), Twilio (WhatsApp) |
| **Voice** | OpenAI Whisper (Urdu/Punjabi transcription) |
| **Documents** | ReportLab (PDF), QRCode (verification) |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Windows / macOS / Linux

### 1. Clone & Setup

```bash
git clone <repo-url>
cd zamindarai
```

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r ../requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=sk-...
# HF_TOKEN=hf_...
# SERPAPI_KEY=...
# APP_SECRET_KEY=your-secret-key
```

### 5. Ingest Knowledge Base

```bash
cd ..
python scripts/ingest_documents.py
```

### 6. Run Backend

```bash
cd backend
$env:PYTHONPATH="."  # Windows
# export PYTHONPATH="."  # macOS/Linux

.\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

Open [http://localhost:8000/docs](http://localhost:8000/docs) for Swagger UI.

### 7. Run Frontend

```bash
cd frontend
..\backend\venv\Scripts\streamlit.exe run app.py
```

Open [http://localhost:8501](http://localhost:8501) for the Streamlit interface.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/farmers/` | POST | Register a farmer |
| `/farmers/{id}` | GET | Get farmer profile |
| `/diagnoses/` | POST | Upload crop photo for diagnosis |
| `/prices/check` | POST | Check if offered price is fair |
| `/contracts/generate` | POST | Generate sale contract |
| `/contracts/generate/notarized` | POST | Generate contract with PDF + QR |
| `/contracts/verify/{hash}` | GET | Verify contract authenticity |
| `/council/chat` | POST | Kisan Council text chat |
| `/council/voice` | POST | Kisan Council voice input |
| `/impact/summary` | GET | Collective impact dashboard data |
| `/whatsapp/webhook` | POST | Twilio WhatsApp webhook |
| `/health` | GET | Health check |
| `/agents` | GET | List available agents |

---

## Project Structure

```
zamindarai/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Environment config
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── main.py            # FastAPI app
│   │   ├── models.py          # DB models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── farmers.py
│   │       ├── diagnoses.py
│   │       ├── prices.py
│   │       ├── contracts.py
│   │       ├── council.py
│   │       ├── impact.py
│   │       └── whatsapp.py
│   ├── agents/
│   │   ├── __init__.py        # Agent registry
│   │   ├── base.py            # BaseAgent abstract class
│   │   ├── crop_doctor.py
│   │   ├── price_oracle.py
│   │   ├── soil_advisor.py
│   │   ├── deal_guardian.py
│   │   └── orchestrator.py    # Kisan Council brain
│   ├── core/
│   │   ├── __init__.py
│   │   ├── vector_store.py    # ChromaDB KnowledgeBase
│   │   ├── scraper.py         # Live price scraper
│   │   ├── contract_pdf.py    # PDF + QR generator
│   │   └── urdu_utils.py      # Roman Urdu normalizer
│   ├── data/
│   │   ├── crop_diseases/
│   │   ├── soil_guides/
│   │   └── mandi_prices.csv
│   ├── venv/
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── app.py                 # Main Streamlit app
│   └── pages/
│       ├── 1_Admin_Dashboard.py
│       └── 2_Impact_Dashboard.py
├── scripts/
│   └── ingest_documents.py    # KB ingestion pipeline
├── docker/
├── .vscode/settings.json
├── requirements.txt           # Full dependency list
└── README.md
```

---

## Key Features

### 🧠 Multi-Agent Orchestration
Farmers don't choose tabs — they speak naturally. The Kisan Council orchestrator analyzes the message, decides which experts to summon, executes them, and synthesizes one unified Roman Urdu response.

### 🗣️ Voice-First Design
Farmers can record voice messages in Urdu/Punjabi. Whisper transcribes → Kisan Council responds → all without typing.

### 📱 WhatsApp Distribution
No app download needed. Farmers message a WhatsApp Business number. Twilio forwards to the Kisan Council.

### 🔐 Contract Notarization
Every sale agreement gets a tamper-proof PDF with SHA-256 hash and QR code. Buyers scan to verify authenticity.

### 🚨 Outbreak Detection
When 2+ farmers in the same district report the same crop disease within 7 days, the system auto-generates an OutbreakAlert.

### 📊 Collective Impact Dashboard
Aggregated metrics: total farmers protected, average price fairness by district, active disease outbreaks, estimated money saved.

---

## Demo Script for Hackathons

1. **Show the Streamlit frontend** — create a farmer profile in the sidebar
2. **Crop Doctor** — upload a wheat disease photo, show AI vision result + treatment
3. **Price Check** — enter an offered price, show fairness analysis
4. **Deal Guardian** — generate a contract, show PDF + QR code
5. **Kisan Council** — type: *"Mere gandum pe zard dhabbay hain aur aarti 25 de raha hai"* — watch 3 agents activate simultaneously
6. **Impact Dashboard** — show district-level fairness + outbreak map
7. **WhatsApp** — mention: *"Twilio sandbox configured for +92 numbers"*

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key (GPT, Whisper) |
| `HF_TOKEN` | No | HuggingFace token (higher rate limits) |
| `SERPAPI_KEY` | No | SerpAPI for live price scraping |
| `APP_SECRET_KEY` | Yes | JWT secret key |
| `DATABASE_URL` | No | Defaults to `sqlite:///./zamindarai.db` |

---

## License

MIT

---

## Credits

Built for **Solo Founder** hackathons. Kisaan ka digital muhaafiz.
