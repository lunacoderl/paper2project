# Bugs & Fixes Registry — Paper2Project

| Bug ID | Component | Description | Status | Fix Details |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | `backend/main.py` | Overly permissive CORS regex allows arbitrary external subdomains | FIXED | Restricted origins to designated `settings.ALLOWED_ORIGINS` whitelist. |
| **BUG-02** | `backend/app/core/firebase.py` | Insecure dev token bypass allowed in production if `DEBUG=True` | FIXED | Conditioned dev bypass strictly to `ENVIRONMENT == "development"` and local origin checks. |
| **BUG-03** | `backend/app/services/document_service.py` | Rejected image uploads (PNG/JPG/WEBP); lacked OCR support | FIXED | Added MIME inspection, magic bytes validation, and OCR text extraction via PyMuPDF. |
| **BUG-04** | `backend/app/services/ranking_service.py` | Missing accuracy extraction and dual-criterion technique/performance ranking | FIXED | Implemented regex performance metric extraction, dual-criterion ranking, and global 1-to-N assignment. |
| **BUG-05** | `frontend/src/app/projects/new/page.tsx` | Skipped keyword verification preview before querying academic APIs | FIXED | Built `KeywordVerificationModal` to preview/edit extracted algorithms, techniques, methods, functions, tools, datasets. |
| **BUG-06** | `frontend/src/lib/semantic-scholar.ts` | Hardcoded limit=8/10; lacked batch pagination for 10-1000 papers | FIXED | Implemented multi-query cursor pagination engine retrieving 10 to 1,000 papers across APIs. |
| **BUG-07** | `frontend/src/app/projects/[projectId]/discover/page.tsx` | No IndexedDB local caching or "Load 10 More" pagination; missing paper card accuracy & datasets | FIXED | Built `Paper2ProjectLocalDB` IndexedDB store, "Load 10 More" pagination, and reusable `<PaperDetailsModal />`. |
| **BUG-08** | `frontend/src/app/projects/[projectId]/improve/page.tsx` | Lacked component-by-component upgrade and validation reasoning | FIXED | Built Component-Level Superiority Engine with technical reasoning for Algorithms, Techniques, Methods, Functions, Tools. |
| **BUG-09** | `frontend/src/app/projects/[projectId]/roadmap/page.tsx` | Questionnaire lacked granular PC hardware specs (CPU, RAM, GPU, SSD) | FIXED | Added PC hardware questionnaire, acceleration mode calibration, and 6-phase prototype roadmap. |
| **BUG-10** | `frontend/src/app/projects/[projectId]/copilot/page.tsx` | Chatbot lacked grounding in retrieved papers and citations | FIXED | Grounded RAG Copilot in project data & local papers with mandatory bracketed `[Source: ...]` citations. |
| **BUG-11** | Backend & Frontend | Missing 1-project-per-10-minutes rate limiter | FIXED | Enforced backend 600s cooldown in `projects.py` and frontend cooldown badge in `new/page.tsx`. |
| **BUG-12** | `backend/app/services/novelty_ranker.py` | Hardcoded ML model dependency crashed if ONNX/PKL file was absent | FIXED | Implemented Strategy Pattern prioritizing local ML model (`models/novelty_model.onnx` or `.pkl`) with safe NLP fallback. |
| **BUG-13** | `frontend/src/lib/semantic-scholar.ts` | Semantic Scholar direct browser calls threw `TypeError: Failed to fetch` due to browser CORS policy | FIXED | Created server-side route `/api/papers/search` proxying Semantic Scholar with academic headers, cascading arXiv, OpenAlex, and grounded synthesis fallback. |
| **BUG-14** | Workspace / `package.json` | Running frontend and backend separately caused desynchronized dev servers and 404 route registration delays | FIXED | Configured single-command monorepo runner with `concurrently` in `package.json`, `run-dev.bat`, and `run-dev.ps1`. |

