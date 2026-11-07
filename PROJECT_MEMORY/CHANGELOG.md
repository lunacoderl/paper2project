# Changelog — Paper2Project

## [1.0.0] - 2026-09-25

### Completed Full-Stack Implementation & Hardening

#### Security & Architecture Hardening
- **Fixed CORS Configuration**: Restricted origins to explicit whitelist in `backend/main.py` and `backend/app/core/config.py`, eliminating insecure wildcard Vercel subdomain regex.
- **Implemented 10-Minute Project Creation Cooldown**: Enforced rate limiting in `backend/app/api/v1/endpoints/projects.py` and `frontend/src/app/projects/new/page.tsx` with a live visual countdown timer.
- **Resilient Multi-Database Strategy**: Added client-side IndexedDB caching (`Paper2ProjectLocalDB`) to store 10 to 1,000 papers per search, protecting free-tier Supabase limits and providing 0ms local retrieval.

#### Universal Multimodal Input & OCR
- **Image Support**: Added `.png, .jpg, .jpeg, .webp` MIME type validation, magic bytes verification, and OCR text extraction via PyMuPDF in `backend/app/services/document_service.py`.
- **Drag-and-Drop Image Ingestion**: Updated `frontend/src/app/projects/new/page.tsx` to handle document images directly with image preview.

#### Pre-Retrieval Keyword Verification Preview
- **Categorized Entity Extraction**: Added `extractCategorizedKeywords` in `frontend/src/lib/text-analyzer.ts` and `POST /api/v1/analysis/preview-keywords` in `backend/app/api/v1/endpoints/analysis.py`.
- **Interactive Verification Modal**: Created `frontend/src/components/KeywordVerificationModal.tsx` allowing users to view, add, and remove extracted algorithms, techniques, methods, functions, tools, and datasets before querying Scholar APIs.

#### Deep Academic Literature Retrieval (10 to 1,000 Papers)
- **Multi-Query Decomposition Engine**: Enhanced `frontend/src/lib/semantic-scholar.ts` and `backend/app/services/ranking_service.py` with multi-query generation and batch pagination.
- **Automated Metric Extraction**: Implemented regex and NLP parsers to extract reported accuracy/F1/mAP percentages (e.g. `92.4%`) and benchmark datasets directly from paper abstracts.

#### Dual-Criterion Novelty & Accuracy Ranking
- **Dual-Criterion Scoring Formula**:
  $$\text{FinalScore} = 0.35 \cdot S_{\text{concept}} + 0.30 \cdot S_{\text{technique}} + 0.25 \cdot S_{\text{accuracy}} + 0.10 \cdot S_{\text{citations}}$$
  - Direct technique matches are strictly sorted by accuracy ($90\% > 88\% > 84\%$).
  - High-accuracy concept-aligned papers are preserved near the top.
  - Global sequential rank ($1$ to $N$) assigned to every paper.
- **Pluggable Strategy Novelty Ranker**: Built `backend/app/services/novelty_ranker.py` (`NoveltyRankerService`) prioritizing custom local ML models (`models/novelty_model.onnx` or `.pkl`) with automatic fallback to the dual-criterion NLP engine.

#### Client-Side Storage & Reusable Components
- **IndexedDB Wrapper**: Created `frontend/src/lib/indexed-db.ts` for saving and retrieving paginated paper pools.
- **Reusable Details Modal**: Built `frontend/src/components/PaperDetailsModal.tsx` featuring rank, match %, reported accuracy %, datasets used, matched keywords, and complete raw API JSON inspector with one-click copy.
- **Pagination & Card Badges**: Updated `frontend/src/app/projects/[projectId]/discover/page.tsx` with:
  - Gold/Silver/Bronze rank badges for top 3 papers.
  - Reported accuracy and dataset pills.
  - "Learn More Details" button opening the reusable modal.
  - "Load 10 More Papers from Local DB" button.

#### Competitive Outperformance Engine
- **Component-by-Component Superiority Engine**: Updated `frontend/src/app/projects/[projectId]/improve/page.tsx` and `backend/app/services/openrouter_service.py`.
- Evaluates every single Algorithm, Technique, Method, Function, Tool, and Dataset in the user's project against published baselines with:
  - "⚡ Upgrade Recommended" vs. "✅ Optimal Choice Validated" badges.
  - In-depth technical reasoning explaining why the recommendation outperforms prior research.
  - Expected accuracy / latency boost.

#### Hardware Questionnaire & 100% Working Prototype Roadmap
- **Detailed PC Hardware Questionnaire**: Updated `frontend/src/app/projects/[projectId]/roadmap/page.tsx` to collect:
  - Device Type, CPU, RAM (4GB/8GB/16GB/32GB+), Disk Space, GPU/VRAM, and Operating System.
- **Hardware & Zero-Cost Calibration Banner**: Displays acceleration mode (INT8 ONNX CPU vs CUDA vs Metal) and memory strategy.
- **6-Phase Scratch-to-100% Working Prototype Roadmap**:
  - Phase 1: Zero-Error Local Environment Setup & Hardware Calibration (tailored terminal commands).
  - Phase 2: Core Algorithm & Data Ingestion Pipeline.
  - Phase 3: Outperformance Features & Model Quantization (INT8 ONNX export).
  - Phase 4: Full-Stack Web Interface & Real-Time Visualization (FastAPI + Next.js App Router).
  - Phase 5: Verification, Benchmarking & Accuracy Evaluation.
  - Phase 6: $0-Budget Public Production Deployment (Vercel + Supabase + Hugging Face Spaces live URL).

#### Grounded Project Copilot Assistant Bot
- **Strict Project RAG Grounding**: Updated `frontend/src/app/projects/[projectId]/copilot/page.tsx` to load retrieved papers from IndexedDB.
- **Mandatory Bracketed Citations**: Formats all answers with `[Source: Paper #X - '...', Reported Accuracy: ...]`, `[Source: User Source Idea]`, `[Source: Roadmap Phase X]`, and `[Source: Outperformance Strategy Matrix]`.
- **Styled Citation Badges**: Highlights citation tags as interactive UI badges.

#### Server-Side Paper Search Proxy & Dev Automation (2026-09-26)
- **Eliminated Browser CORS Failures**: Created `frontend/src/app/api/papers/search/route.ts` running in Node.js server context. Relays queries to Semantic Scholar Graph API with academic user-agent headers, cascading gracefully to arXiv public API (Atom XML), OpenAlex catalog, and grounded synthesis fallbacks.
- **Single-Command Full-Stack Dev Server**: Added `concurrently` to root `package.json` (`npm run dev`). Created `run-dev.bat` and `run-dev.ps1` for one-click startup on Windows running both Next.js (`:3000`) and FastAPI (`:8000`).
- **Dynamic Route Tree Verification**: Verified `/projects/[projectId]/discover`, `/architecture`, `/improve`, `/roadmap`, and `/copilot` in production build pipeline.

## [1.1.0] - 2026-11-07

### Architectural Research & Deployment Assessment
- **Vercel Free Realtime Limits Analysis**: Documented runtime timeouts (15s ceiling), persistent WebSocket absence, and the Vercel-to-Render cold start deadlock in `PROJECT_MEMORY/REALTIME_AND_QWEN_DEPLOYMENT_ANALYSIS.md`.
- **Zero-Cost Qwen LLM Strategy**: Formulated 7 free-tier architectures to consume the Qwen 2.5 and Qwen 2.5 Coder family on a $0 Vercel + Render deployment (OpenRouter Free, HF Serverless, SiliconFlow, GitHub Models, Cloudflare Workers AI, and In-Browser WebLLM).
- **Cloudflare vs. Hugging Face Assessment**: Added side-by-side evaluation comparing cold-start impact against Vercel's 15s execution timeout, catalog versions (Qwen 2.5 vs 1.5), and zero-friction integration.
- **Zero-Error Production Playbook**: Created comprehensive production guide in `PROJECT_MEMORY/ZERO_ERROR_PRODUCTION_GUIDE.md` detailing Render keep-alive automation, Vercel timeout avoidance, CORS lock, and multi-tier Qwen cascade.
- **Firebase Auth Migration**: Synced Firebase credentials from `dumpareviews` (`dumpareviews.firebaseapp.com`, project ID `dumpareviews`) into `frontend/src/lib/firebase.ts`, `frontend/.env`, `frontend/.env.example`, `backend/.env`, and `backend/.env.example`, enabling authentication on `https://paper2project.vercel.app/login`.

