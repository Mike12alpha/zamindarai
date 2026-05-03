# ZamindarAI — Development Summary

> **Date**: May 2026  
> **Project**: ZamindarAI — AI-powered agricultural protection system for Pakistani farmers  
> **Repository**: https://github.com/Mike12alpha/zamindarai

---

## Table of Contents

1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
   - [Complete Urdu Translation](#1-complete-urdu-translation)
   - [AI Responses in Urdu](#2-ai-responses-in-urdu)
   - [WhatsApp Integration](#3-whatsapp-integration)
   - [Voice Input](#4-voice-input)
   - [Combobox Inputs (Dropdown + Free Text)](#5-combobox-inputs-dropdown--free-text)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [File Changes](#file-changes)
5. [New Components & Utilities](#new-components--utilities)
6. [Backend Changes](#backend-changes)
7. [Frontend Changes](#frontend-changes)
8. [Docker & Deployment](#docker--deployment)
9. [Translation Keys](#translation-keys)
10. [Known Issues & Future Work](#known-issues--future-work)

---

## Overview

ZamindarAI is an AI-powered platform designed to protect Pakistani farmers through intelligent agents. The system provides crop disease diagnosis, market price checking, soil advisory, contract generation, and a unified Kisan Council chat interface.

This document summarizes all enhancements made to the project, focusing on **localization (Urdu)**, **multimodal input (voice)**, **WhatsApp connectivity**, and **UX improvements (combobox inputs)**.

---

## Features Implemented

### 1. Complete Urdu Translation

**Goal**: When the user switches to Urdu, every visible UI element is fully in Urdu script — no mixed English words.

**What was done**:
- Expanded `frontend/messages/en.json` and `frontend/messages/ur.json` with comprehensive keys for all pages
- Added translation keys for:
  - Crop names (گندم, چاول, کپاس, گنا, مکئی, ٹماٹر, آلو, پیاز)
  - Soil types (گداز, ریتلی, چکنی, گلیل, نامعلوم)
  - District names (لاہور, فیصل آباد, ملتان, گوجرانوالہ, etc.)
  - Voice input labels (آواز کا ان پٹ, سن رہے ہیں..., اس براؤزر میں آواز کا ان پٹ دستیاب نہیں ہے)
  - WhatsApp labels (واٹس ایپ پر بات چیت)
  - Auth error messages (لاگ ان ناکام, رجسٹریشن ناکام)
- Audited and fixed hardcoded English strings in:
  - `dashboard/page.tsx`
  - `council/page.tsx`
  - `crop-doctor/page.tsx`
  - `price-oracle/page.tsx`
  - `soil-advisor/page.tsx`
  - `deal-guardian/page.tsx`
  - `login/page.tsx`
  - `register/page.tsx`
  - `page.tsx` (home/landing)
- Ensured RTL direction is set correctly in `layout.tsx` when locale is `ur`

### 2. AI Responses in Urdu

**Goal**: When Urdu is selected, all AI agent responses are generated entirely in Urdu script.

**What was done**:
- Updated all Urdu system prompts in `backend/core/i18n.py` with an explicit instruction:
  > *"جواب صرف اور صرف اردو میں لکھیں۔ کوئی انگریزی لفظ استعمال نہ کریں۔"*
- Affected prompts:
  - `crop_doctor` (ur)
  - `price_oracle` (ur)
  - `soil_advisor` (ur)
  - `deal_guardian` (ur)
  - `orchestrator_plan` (ur)
  - `orchestrator_synthesize` (ur)
- Ensured all backend endpoints (`/diagnoses/`, `/prices/check`, `/soil/advise`, `/contracts/generate`, `/council/chat`) receive and pass the `language` parameter

### 3. WhatsApp Integration

**Goal**: Farmers can interact with the Kisan Council via WhatsApp.

**What was done**:

**Backend**:
- Wired `whatsapp` router into `backend/app/main.py`
- Rewrote `backend/app/routers/whatsapp.py` with:
  - Urdu/English language detection using Unicode range heuristics (`\u0600-\u06FF`)
  - Direct orchestrator calls (bypasses HTTP auth issues)
  - Auto-creation of placeholder farmer users from phone numbers
  - Lazy orchestrator loading to avoid startup crashes
- **Twilio dependency**: `twilio==9.10.5` already present in `requirements.txt`

**Frontend**:
- Added WhatsApp contact card to Dashboard page
- Shows WhatsApp icon, description, and placeholder number (`+92-300-XXXXXXX`)
- Admin can configure the actual number

**Deployment Safety**:
- WhatsApp router is wrapped in `try/except` in `main.py`
- If WhatsApp module fails to load, the rest of the app continues normally

### 4. Voice Input

**Goal**: Users can speak their questions in Urdu or English on any agent page.

**What was done**:

**New Component**: `frontend/components/VoiceInputButton.tsx`
- Uses the **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`)
- Language mapping:
  - `en` → `en-US`
  - `ur` → `ur-PK`
- UI states:
  - Idle: Mic icon
  - Listening: Pulsing red indicator with spinning loader
  - Not supported: Mic-off icon with disabled state
- Props: `onResult`, `locale`, `disabled`, `className`
- Appends recognized text to existing input (with space separator)

**Pages with Voice Input**:

| Page | Field |
|------|-------|
| **Kisan Council** | Chat textarea |
| **Crop Doctor** | Crop type combobox |
| **Price Oracle** | Crop, Location fields |
| **Soil Advisor** | Question field |
| **Deal Guardian** | Buyer name, Crop fields |

### 5. Combobox Inputs (Dropdown + Free Text)

**Goal**: Replace hardcoded `<select>` dropdowns with inputs that show suggestions but allow free text entry if the user's option is not in the list.

**What was done**:

**New Utility**: `frontend/lib/options.ts`
- Centralized option arrays:
  - `DISTRICTS` — 20 Pakistani districts
  - `CROPS` — 16 crop types
  - `SOIL_TYPES` — 5 soil types
  - `QUANTITIES` — 15 common quantity strings

**New Component**: `frontend/components/ComboInput.tsx`
- Native HTML `<input>` + `<datalist>` approach
- Zero external dependencies
- Shows a dropdown chevron icon
- Fully editable — user can pick from list or type freely

**Pages Updated**:

| Page | Field | Options Source |
|------|-------|---------------|
| **Register** | District | `DISTRICTS` |
| **Register** | Primary Crop | `CROPS` |
| **Crop Doctor** | Crop Type | `CROPS` |
| **Soil Advisor** | Current Crop | `CROPS` |
| **Soil Advisor** | Previous Crop | `['None', ...CROPS]` |
| **Soil Advisor** | Soil Type | `SOIL_TYPES` |
| **Price Oracle** | Crop | `CROPS` |
| **Price Oracle** | Quantity | `QUANTITIES` |
| **Price Oracle** | Location | `DISTRICTS` |
| **Deal Guardian** | Crop | `CROPS` |
| **Deal Guardian** | Quantity | `QUANTITIES` |

---

## Architecture & Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **AI Model**: Google Gemini (`gemini-flash-latest`, `gemini-pro-latest`)
- **Database**: PostgreSQL (with SQLite fallback)
- **ORM**: SQLAlchemy
- **Vector Store**: ChromaDB with HuggingFace embeddings
- **Auth**: JWT tokens
- **External**: Twilio (WhatsApp), requests, BeautifulSoup

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl (English + Urdu)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Build Output**: Standalone (for Docker)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Coolify
- **Ports**:
  - Frontend: `13000:3000`
  - Backend: `18000:8000`
  - Database: internal only

---

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `backend/app/main.py` | Added whatsapp router with lazy import and error handling |
| `backend/app/routers/whatsapp.py` | Rewrote webhook with language detection, direct orchestrator calls, lazy initialization |
| `backend/core/i18n.py` | Strengthened all Urdu prompts with "only Urdu" instruction |
| `docker-compose.yaml` | Simplified healthcheck from Python script to `curl` |
| `backend/Dockerfile` | Added `netcat-openbsd`, bumped `CACHE_BUST` to `2026-05-03` |
| `frontend/app/[locale]/dashboard/page.tsx` | Fixed translations, added WhatsApp card, refactored to use `useT()` |
| `frontend/app/[locale]/dashboard/council/page.tsx` | Added VoiceInputButton, fixed empty state text |
| `frontend/app/[locale]/dashboard/crop-doctor/page.tsx` | Added `ComboInput` + `VoiceInputButton`, passes `language` to API |
| `frontend/app/[locale]/dashboard/price-oracle/page.tsx` | Added `ComboInput` + `VoiceInputButton`, passes `language` to API |
| `frontend/app/[locale]/dashboard/soil-advisor/page.tsx` | Added `ComboInput` + `VoiceInputButton`, passes `language` to API |
| `frontend/app/[locale]/dashboard/deal-guardian/page.tsx` | Added `ComboInput` + `VoiceInputButton`, passes `language` to API |
| `frontend/app/[locale]/login/page.tsx` | Fixed error message translation |
| `frontend/app/[locale]/register/page.tsx` | Added `ComboInput` for district and crop, fixed translations |
| `frontend/app/[locale]/page.tsx` | Translated feature titles |
| `frontend/messages/en.json` | Added missing keys for voice, WhatsApp, crops, soil types, errors |
| `frontend/messages/ur.json` | Complete Urdu translations for all new keys |

### New Files

| File | Purpose |
|------|---------|
| `frontend/components/VoiceInputButton.tsx` | Reusable browser speech recognition button |
| `frontend/components/ComboInput.tsx` | Reusable combobox input using `<input>` + `<datalist>` |
| `frontend/lib/options.ts` | Centralized option arrays (districts, crops, soil types, quantities) |

---

## New Components & Utilities

### VoiceInputButton
```tsx
<VoiceInputButton
  locale={locale}
  onResult={(text) => setInput((prev) => prev + (prev ? ' ' : '') + text)}
  disabled={loading}
/>
```
- Uses `window.SpeechRecognition` or `window.webkitSpeechRecognition`
- Supports `ur-PK` and `en-US`
- Gracefully degrades if browser doesn't support speech recognition

### ComboInput
```tsx
<ComboInput
  name="crop"
  value={form.crop}
  onChange={handleChange}
  options={CROPS}
  listId="price-crops"
  placeholder={t('priceOracle.crop')}
/>
```
- Native `<datalist>` for zero-dependency dropdown suggestions
- User can select from dropdown or type any custom value
- Styled consistently with existing form inputs

### lib/options
```ts
import { DISTRICTS, CROPS, SOIL_TYPES, QUANTITIES } from '@/lib/options';
```
- Single source of truth for all dropdown/combobox options
- Values are in English (for backend compatibility)
- Labels are translated at render time via `t()`

---

## Backend Changes

### Prompt Strengthening (`core/i18n.py`)
All Urdu system prompts now include:
```
جواب صرف اور صرف اردو میں لکھیں۔ کوئی انگریزی لفظ استعمال نہ کریں。
```
This ensures AI responses are pure Urdu without English loanwords.

### WhatsApp Router (`app/routers/whatsapp.py`)
```python
def detect_language(text: str) -> str:
    urdu_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F]', text))
    ratio = urdu_chars / total_chars
    return "ur" if ratio > 0.3 else "en"
```

### Lazy Loading Pattern
```python
_orchestrator = None

def _get_orchestrator():
    global _orchestrator
    if _orchestrator is None:
        from agents.orchestrator import KisanCouncilOrchestrator
        _orchestrator = KisanCouncilOrchestrator()
    return _orchestrator
```

### Safe Router Registration (`app/main.py`)
```python
try:
    from app.routers import whatsapp
    app.include_router(whatsapp.router)
    print("[STARTUP] WhatsApp router loaded")
except Exception as e:
    print(f"[STARTUP WARNING] WhatsApp router failed to load: {e}")
    traceback.print_exc()
```

---

## Frontend Changes

### Language Parameter Passing
All agent pages now send the current locale to the backend:

| Page | API Endpoint | Language Field |
|------|-------------|----------------|
| Crop Doctor | `POST /diagnoses/` | `formData.append('language', locale)` |
| Price Oracle | `POST /prices/check` | `body: JSON.stringify({..., language: locale})` |
| Soil Advisor | `POST /soil/advise` | `body: JSON.stringify({..., language: locale})` |
| Deal Guardian | `POST /contracts/generate` | `body: JSON.stringify({..., language: locale})` |
| Kisan Council | `POST /council/chat` | `formData.append('language', locale)` |

### RTL Support
```tsx
<html lang={locale} dir={locale === 'ur' ? 'rtl' : 'ltr'}>
```
The root layout sets `dir="rtl"` for Urdu, ensuring proper text direction.

---

## Docker & Deployment

### Healthcheck Fix
**Before**:
```yaml
test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)\" || exit 1"]
```

**After**:
```yaml
test: ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
```

### Cache Bust
```dockerfile
ARG CACHE_BUST=2026-05-03
```
Forces Docker to re-copy application code and avoid stale layers.

### System Packages
```dockerfile
RUN apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev python3-dev pkg-config curl netcat-openbsd
```
Added `netcat-openbsd` for network debugging alongside existing `curl`.

---

## Translation Keys

### New Keys Added to Both `en.json` and `ur.json`

**Dashboard**:
- `dashboard.councilTitle`
- `dashboard.councilSubtitle`
- `dashboard.whatsappTitle`
- `dashboard.whatsappDesc`
- `dashboard.whatsappNumber`

**Crop Doctor**:
- `cropDoctor.wheat`, `cropDoctor.rice`, `cropDoctor.cotton`, etc.
- `cropDoctor.description`

**Soil Advisor**:
- `soilAdvisor.none`, `soilAdvisor.loamy`, `soilAdvisor.sandy`, etc.

**Price Oracle / Deal Guardian**:
- `priceOracle.currency` / `dealGuardian.currency`

**Council**:
- `council.emptyState`
- `council.listening`
- `council.speakNow`
- `council.voiceNotSupported`

**Auth**:
- `auth.loginFailed`
- `auth.registerFailed`
- `auth.lahore`, `auth.faisalabad`, etc.
- `auth.vegetables`

---

## Known Issues & Future Work

1. **WhatsApp Number**: The dashboard shows a placeholder number (`+92-300-XXXXXXX`). This needs to be replaced with the actual Twilio WhatsApp Business number in production.

2. **Voice Input Browser Support**: The Web Speech API works best in Chrome/Chromium. Safari and Firefox have limited or no support for `ur-PK`. The component gracefully degrades with a disabled mic icon.

3. **WhatsApp Image Handling**: The current webhook detects image attachments (`MediaUrl0`) but only returns a placeholder message. Full image analysis via WhatsApp requires downloading the image from Twilio and passing it to the Crop Doctor agent.

4. **Audio Upload**: Translation keys exist for `council.uploadAudio` but the file-upload voice feature is not yet implemented. Browser-based speech-to-text is the current approach.

5. **Crop Doctor Voice**: Voice input for the Crop Doctor is limited to selecting the crop type. A future enhancement could add a text description field for voice-describing symptoms.

6. **District/Crop Translations**: While dropdown labels are translated, the actual values sent to the backend remain in English. This is intentional for backend compatibility but means free-text entries by Urdu users will arrive as English transliterations.

---

## How to Deploy

```bash
# Clone
git clone https://github.com/Mike12alpha/zamindarai.git
cd zamindarai

# Environment
cp .env.example .env
# Edit .env with your GOOGLE_API_KEY, DB_PASSWORD, etc.

# Build & run
docker compose up -d --build

# Access
# Frontend: http://localhost:13000
# Backend API: http://localhost:18000
# API Docs: http://localhost:18000/docs
```

---

*End of Summary*
