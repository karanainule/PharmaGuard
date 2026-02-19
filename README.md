<<<<<<< HEAD
# PharmaGuard — Pharmacogenomic Risk Prediction System

AI-powered web application that predicts drug-gene interaction risks from patient VCF files with LLM-generated clinical explanations.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI or Gemini API key (optional — fallback explanations work without one)

---

## Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API key(s)

# Run server
uvicorn main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

Frontend will be live at `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)
```
OPENAI_API_KEY=sk-...      # OpenAI API key (GPT-4o-mini)
GEMINI_API_KEY=AIza...     # Google Gemini API key (alternative)
```

Only one is needed. If neither is provided, rich fallback explanations are used automatically.

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## Usage

1. Open `http://localhost:3000`
2. Upload a `.vcf` file (use `backend/test_sample.vcf` for testing)
3. Select one or more drugs to analyze
4. Click **Run Pharmacogenomic Analysis**
5. View results — risk badges, gene profiles, AI explanations, variant tables
6. Download JSON report or copy to clipboard

**Demo Mode**: Click "Demo Mode" (no VCF needed) to test with synthetic patient data.

---

## Supported Genes & Drugs

| Gene | Drug | Common Risk |
|------|------|-------------|
| CYP2D6 | CODEINE | Toxic (URM), Ineffective (PM) |
| CYP2C19 | CLOPIDOGREL | Ineffective (PM) |
| CYP2C9 | WARFARIN | Toxic (PM) |
| SLCO1B1 | SIMVASTATIN | Myopathy risk |
| TPMT | AZATHIOPRINE | Severe myelosuppression (PM) |
| DPYD | FLUOROURACIL | Life-threatening toxicity (PM) |

---

## API Endpoints

### `POST /analyze`
Analyze a VCF file for drug-gene interactions.

**Form data:**
- `file`: VCF file (`.vcf`, max 5MB)
- `drugs`: Comma-separated drug names (e.g., `CODEINE,WARFARIN`)
- `patient_id` (optional): Patient identifier

### `POST /analyze/demo`
Run demo analysis with synthetic VCF data.

**Form data:**
- `drugs`: Comma-separated drug names

### `GET /health`
Service health check and capabilities.

---

## Output JSON Schema

```json
{
  "patient_id": "PATIENT_001",
  "drug": "CLOPIDOGREL",
  "timestamp": "2024-01-01T00:00:00Z",
  "risk_assessment": {
    "risk_label": "Ineffective",
    "confidence_score": 0.90,
    "severity": "high"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "CYP2C19",
    "diplotype": "*2/*2",
    "phenotype": "Poor Metabolizer",
    "detected_variants": []
  },
  "clinical_recommendation": {
    "action": "...",
    "notes": "..."
  },
  "llm_generated_explanation": {
    "summary": "...",
    "mechanism": "...",
    "clinical_impact": "..."
  },
  "quality_metrics": {
    "vcf_parsing_success": true
  }
}
```

---

## Deployment

### Backend → Render
1. Create new **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `OPENAI_API_KEY` or `GEMINI_API_KEY`

### Frontend → Vercel
1. Import project on [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## LLM Prompt Template

```
You are a clinical pharmacogenomics expert AI assistant.

Patient Data:
- Drug: {drug}
- Gene: {gene}
- Variant ID: {variant_id}
- Diplotype: {diplotype}
- Phenotype: {phenotype}
- Predicted Risk: {risk_label}
- Severity: {severity}

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence clinical summary",
  "mechanism": "Molecular/enzymatic mechanism explanation",
  "clinical_impact": "Clinical implications for healthcare providers"
}
```

---

## Project Structure

```
pharmaguard/
├── backend/
│   ├── main.py          # FastAPI app, routes
│   ├── parser.py        # VCF parsing engine
│   ├── predictor.py     # Rule-based risk prediction
│   ├── llm_service.py   # OpenAI/Gemini integration
│   ├── schemas.py       # Pydantic models
│   ├── requirements.txt
│   ├── test_sample.vcf  # Sample test file
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── RiskBadge.jsx
    │   │   ├── RiskGauge.jsx
    │   │   └── DrugCard.jsx
    │   ├── pages/
    │   │   ├── UploadPage.jsx
    │   │   └── ResultsPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## Disclaimer

PharmaGuard is a clinical decision support tool for research and educational purposes. Results must be interpreted by qualified healthcare professionals. Not for standalone clinical use.
=======
# PharmaGuard
>>>>>>> 5c2bdd133d57d500ec3648a6f9a723f101fc62b4
