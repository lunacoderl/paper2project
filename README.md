# 🚀 Paper2Project — Research to Implementation AI Platform

> **Transform raw ideas, documents, and research papers into production-ready software implementations with literature gap analysis, competitive advantage blueprints, and zero-cost roadmaps.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Semantic Scholar](https://img.shields.io/badge/Semantic_Scholar-200M+_Papers-0070f3)](https://www.semanticscholar.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-12.0-ff0072)](https://reactflow.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 What is Paper2Project?

Turning an academic research paper or a technical idea into working software is hard. Developers and researchers face the same questions:
- *Has this already been implemented in existing research?*
- *How much of my idea is already solved, and which exact features overlap?*
- *How can I build a better implementation that stands out and outperforms published papers?*
- *How can I implement this with my exact timeline, available equipment, and a $0 budget?*

**Paper2Project** solves this by providing an end-to-end intelligent pipeline that deconstructs your input, searches millions of research papers, computes an exact feature overlap percentage, highlights your competitive advantages, and builds a personalized, step-by-step roadmap from **$0 free-tier** to scale.

---

## ✨ Key Features

### 1. 📄 Universal Input Processing
- Upload **PDFs, DOCX, TXT**, or type any raw text prompt / idea abstract.
- Client-side and server-side NLP extracts core technical entities, domains, problem statements, solutions, features, and technology stacks.

### 2. 🔬 Anchor-Bootstrapped Hybrid CF/CBF & Novelty Predictor Model
Grounded on:
> **Base Paper**: *"A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata"* (Sakib et al., *IEEE Access*, 2021)

- **Step 0 — Anchor Bootstrap (Cold-Start Solution)**:
  - Since an unpublished student idea has no existing citations, semantic search across scholarly APIs (Semantic Scholar, OpenAlex, arXiv) identifies the closest real published paper as the **"Anchor Paper"**.
- **CF Branch (Algorithm 1, Steps 1-3)**:
  - Extracts 2-level citation relations: papers citing the anchor ($1^{\text{st}}$ level) and papers the anchor references ($2^{\text{nd}}$ level).
  - Builds co-citation and bibliographic coupling matrices.
  - Computes Jaccard citation similarity $\to$ $\text{CF\_score}$.
- **CBF Branch (Content-Based Filtering)**:
  - Computes cosine similarity between `idea_vector` (via `bge-small-en-v1.5`) and candidate paper embeddings $\to$ $\text{CBF\_score}$.
- **Hybrid Scoring Layer**:
  $$\text{hybrid\_score} = \frac{\text{CBF\_score} + \text{CF\_score}}{2} \quad \text{(with CBF fallback if no anchor)}$$
- **Model 3: Novelty Scoring & Gap Detection**:
  - **Calibrated Novelty Score (%)** vs. **Literature Overlap Score (%)**.
  - **Multi-Dimensional Breakdown**:
    - 🎯 **Problem Novelty**: Rarity of the target problem formulation.
    - ⚙️ **Methodological Novelty**: Innovation in algorithms and architectures.
    - 🚀 **Implementation Novelty**: Zero-cost, edge latency, and practical differentiation.
  - **Feature-by-Feature Matrix**:
    - 🔴 **Fully Implemented in Prior Work**
    - 🟡 **Partially Explored**
    - 🟢 **Novel / Greenfield Territory**
  - Direct comparison: *"How Existing Research Solves It"* vs. *"Your Novel Advantage"*.

### 3. 💡 Competitive Advantage & Innovation Blueprint
- Strategic recommendations explaining **"Why This Beats Published Papers"**.
- Actionable steps for edge optimization, quantization, self-correcting agent loops, and zero-cost serverless hosting.
- 1-click **"Accept Idea"** to automatically integrate suggestions into your roadmap.

### 4. 📅 Customizable $0+ Roadmap with Questionnaire
- Interactive questionnaire calibrating your execution plan:
  - **Time Period**: 1–2 Weeks (MVP), 1 Month (Fast Prototype), 3 Months (Standard), or 6 Months (Research Grade).
  - **Equipment / Hardware**: Standard Laptop (CPU), Cloud GPU (Colab/RunPod), Edge Hardware (Raspberry Pi/Jetson), or Dedicated Server.
  - **Budget**: **$0.00 Free-Tier** (Vercel, Supabase, Colab T4, Hugging Face Free API) up to Custom Budgets.
  - **Team Size & Skill Level**: Solo (1), Pair (2), or Team (3–5).
- Detailed phases, estimated hours, budget breakdowns, and an interactive task checklist that persists to `localStorage`.

### 5. 🤖 Dual-Pane Copilot AI Architect
- Grounded on your active project blueprint, literature overlap data, and roadmap.
- **Specialization Modes**: All-Round Architect, Literature & Prior Art, Competitive Edge, $0 Budget & Setup, Code & APIs.
- Returns clean, syntax-highlighted code blocks with a **"Copy Code"** button.
- **Export Chat Transcript** to clipboard with one click.

### 6. 📊 Interactive React Flow Architecture
- Generates dynamic node graphs for **System Layers**, **Data Pipeline**, and **$0 Cloud Deployments**.
- Light-themed, customizable canvas with node inspection and minimap.

### 7. 🎨 Vibrant, Colorful Light Theme
- Completely redesigned from dark mode to a premium light aesthetic.
- Subtle ambient radial gradients, light glassmorphism, crisp white elevated cards, and colorful pastel badges.

---

## 🔬 Scientific Architecture & Pipeline (Sakib et al. 2021)

```
┌──────────────────────────────────────────────────────────┐
│ INPUT: Student's Idea (raw text / uploaded doc)          │
└───────────────────────────┬────────────────────────────┘
                             ▼
                ┌────────────────────────┐
                │ MODEL 1: EXTRACTION    │
                │ (LLM / NLP-based)      │
                │ → title, abstract,     │
                │   keywords, methods    │
                └───────────┬────────────┘
                            ▼
         ┌──────────────────────────────────────┐
         │ EMBEDDING LAYER                       │
         │ bge-small-en-v1.5 / SBERT             │
         │ → idea_vector                        │
         └──────────────────┬─────────────────────┘
                            ▼
         ┌──────────────────────────────────────┐
         │ STEP 0 — ANCHOR BOOTSTRAP (NEW)       │
         │ Semantic search across retrieval APIs │
         │ (Semantic Scholar / OpenAlex / arXiv)  │
         │ → find closest REAL paper = "anchor"  │
         └───────────┬────────────────┬──────────┘
                     │                │
        anchor found │                │ no strong anchor
        (has citations)│               │ (CF skipped)
                     ▼                ▼
   ┌─────────────────────────┐   ┌─────────────────────────┐
   │ CF BRANCH (citation)    │   │ CBF-ONLY FALLBACK       │
   │                         │   │ (semantic similarity    │
   │ Algorithm 1, Steps 1-3: │   │  across candidates only)│
   │ • Papers citing anchor  │   └────────────┬────────────┘
   │ • Papers anchor cites   │                │
   │ • Co-occurrence matrix  │                │
   │ • Jaccard similarity    │                │
   │   → CF_score            │                │
   └───────────┬─────────────┘                │
               │                              │
               ▼                              │
   ┌─────────────────────────┐                │
   │ CBF BRANCH (content)    │                │
   │                         │                │
   │ idea_vector vs each     │                │
   │ candidate's embedding   │                │
   │ → cosine similarity     │                │
   │ → CBF_score             │                │
   └───────────┬─────────────┘                │
               │                              │
               ▼                              ▼
      ┌─────────────────────────────────────────┐
      │ HYBRID SCORING LAYER                     │
      │ IF anchor found:                         │
      │   hybrid_score = (CBF_score+CF_score)/2  │
      │ ELSE:                                    │
      │   hybrid_score = CBF_score                │
      └───────────────────┬──────────────────────┘
                          ▼
      ┌─────────────────────────────────────────┐
      │ RESULTS NORMALIZATION & RANKING          │
      │ → Top-N candidate papers, ranked          │
      └───────────────────┬──────────────────────┘
                          ▼
              Feeds → Comparison Engine
              → Novelty Scoring (Model 3)
              → Gap Detection / Recommendations
              → Roadmap (Model 2)
```

---

## 🏗️ Repository Architecture

```
paper2project/
├── frontend/                     # Next.js 16 + React 19 + Tailwind v4
│   ├── src/
│   │   ├── app/                  # App Router pages (Dashboard, Discover, Improve, Roadmap, etc.)
│   │   ├── components/           # Navbar, Sidebar, AuthProvider
│   │   └── lib/
│   │       ├── novelty-client.ts # Novelty Predictor API client (with offline fallback)
│   │       ├── demo-engine.ts    # Client-side heuristic and comparison engine
│   │       ├── text-analyzer.ts  # NLP and document parsing
│   │       └── semantic-scholar.ts # Academic Graph client
│   ├── public/                   # Branding assets & logos
│   ├── vercel.json               # Frontend Vercel configuration
│   └── package.json
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── novelty.py    # POST /novelty/predict, GET /novelty/info
│   │   │   │   └── discover.py   # Multi-source discovery endpoints
│   │   │   └── router.py         # v1 API router
│   │   ├── models/
│   │   │   └── novelty_predictor.py # Model 3: Novelty Scoring & Gap Engine
│   │   ├── schemas/
│   │   │   └── novelty.py        # Pydantic schemas for novelty & hybrid ranking
│   │   ├── services/
│   │   │   ├── anchor_service.py     # Step 0: Anchor Bootstrapping
│   │   │   ├── citation_cf_service.py# Algorithm 1: 2-level citation CF
│   │   │   ├── hybrid_ranker.py      # Fused (CBF + CF) / 2 ranker
│   │   │   ├── novelty_service.py    # Pipeline coordinator
│   │   │   └── embedding_service.py  # bge-small / SentenceTransformers
│   │   └── providers/            # Semantic Scholar, OpenAlex, arXiv
│   ├── scripts/
│   │   └── test_hybrid_recommendation_pipeline.py # End-to-end verification
│   ├── tests/
│   │   ├── test_novelty_predictor.py # Algorithmic unit tests
│   │   └── test_api_endpoints.py     # FastAPI endpoint tests
│   ├── main.py                   # FastAPI entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
├── docs/                         # Project architecture & system designs
├── shared/                       # Shared schemas and data models
├── vercel.json                   # Root monorepo Vercel configuration
├── .gitignore                    # Global ignore rules
└── README.md
```


---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.17+ (v20+ recommended)
- **Python**: v3.10+
- **Git**

---

### 1. Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> The frontend is self-contained with a client-side intelligence engine and Semantic Scholar API connection. You can use Guest Developer mode immediately without any API keys!

---

### 2. Backend Setup (FastAPI)

```bash
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start backend server with Uvicorn
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🌐 Deployment Guides

### 1. Deploying Frontend to Vercel

The repository is configured for direct Next.js monorepo deployment on Vercel:

1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your **`paper2project`** repository.
3. In **Project Settings**:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Next.js`
4. Click **Deploy**!

> [!NOTE]
> The root `package.json` and `frontend/vercel.json` ensure that whether imported from root or from `./frontend`, Vercel builds the Next.js app with `next build` without path errors.

---

### 2. Deploying Backend to Render

The repository includes a ready-to-deploy `render.yaml` Blueprint and pinned `.python-version` (Python 3.11.9) with pre-compiled wheels for all dependencies:

#### Option A: Automatic Blueprint Deploy
1. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
2. Connect your `paper2project` GitHub repository.
3. Render will detect `render.yaml` and set up the Web Service automatically.

#### Option B: Manual Web Service Setup
1. In Render, click **New +** -> **Web Service**.
2. Connect `paper2project` repo.
3. Configure the following fields:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `PYTHON_VERSION`: `3.11.9`
5. Click **Create Web Service**.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **State & Store** | Zustand with `localStorage` persistence |
| **Interactive Graph** | React Flow (`@xyflow/react`) |
| **Academic APIs** | Semantic Scholar Academic Graph API (200M+ Papers), arXiv API |
| **Backend** | FastAPI, Uvicorn, Python 3.13, Pydantic v2 |
| **Database & Auth** | Supabase (PostgreSQL + pgvector), Firebase Auth |
| **Styling** | Modern Light Glassmorphism, Tailwind v4, Lucide Icons |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
