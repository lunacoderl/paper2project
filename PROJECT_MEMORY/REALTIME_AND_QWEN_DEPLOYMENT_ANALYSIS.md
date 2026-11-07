# Realtime Limitations (Vercel Free) & Qwen LLM Integration Strategies

## 1. Project Deployment Snapshot
- **Frontend**: Next.js 16.3.3 (React 19, TypeScript, Tailwind CSS v4, Zustand, IndexedDB) deployed on **Vercel Hobby Tier**.
- **Backend**: FastAPI 0.115.0 (Python 3.11+, Uvicorn, PyMuPDF, Supabase, Firebase) deployed on **Render Free Web Service** (`render.yaml`).
- **Data Flow**: The frontend connects to backend endpoints via `NEXT_PUBLIC_API_URL` (`https://<service>.onrender.com/api/v1`) and proxies academic queries via Next.js serverless route `/api/papers/search`.

---

## 2. Realtime Limitations on Vercel Free (Hobby Tier)

### A. Lack of Persistent Bidirectional WebSockets
- Vercel Serverless Functions and Edge Functions are **stateless and ephemeral**.
- Vercel **does not support long-lived WebSocket servers** (`ws://` or `wss://`). Any Next.js API route attempting to hold a persistent WebSocket server connection will fail.
- **Solution for Paper2Project**: WebSockets must terminate directly on Render (`uvicorn` backend), or utilize external managed realtime infrastructure like **Supabase Realtime** (which is already configured in the stack).

### B. 15-Second Execution Duration Limit
- Vercel Hobby tier strictly limits Serverless Function execution to **15 seconds** (`maxDuration: 15`).
- If long-running paper retrieval (querying Semantic Scholar + arXiv + OpenAlex for 100+ papers) or multi-step LLM reasoning (outperformance analysis / roadmap synthesis) is proxied via Next.js API routes (`/api/...`), requests exceeding 15s are terminated with `504 FUNCTION_INVOCATION_TIMEOUT`.
- **Streaming (SSE / ReadableStream)** works within Vercel, but the stream duration cannot exceed 15 seconds on the Hobby plan.

### C. The Vercel + Render "Cold Start / Double Death" Trap
- Render Free Web Services automatically **spin down / sleep after 15 minutes of inactivity**.
- Waking up a Render instance takes **50 to 90 seconds**.
- If the Vercel frontend proxies calls to Render via Next.js Serverless Routes, Vercel will time out at 15s while Render is still waking up.
- Direct browser-to-Render requests will experience a 50–90 second initial loading delay before any realtime stream can begin.

### D. Hobby Plan Resource Constraints
- 100 concurrent Serverless Function executions max.
- 1,024 MB RAM limit per function (cannot run localized models or heavy embeddings in Vercel functions).
- 4.5 MB request/response body limit for non-streamed endpoints.

---

## 3. Alternative Zero-Cost ($0) Ways to Use the Qwen LLM Family

Render Free instances provide only **512 MB RAM** and shared CPU with **no GPU**. Running Qwen locally (even 0.5B or 1.5B quantized GGUF) will trigger immediate OOM errors. Qwen must be consumed via free inference APIs or in-browser engines:

| Method | Model | Pricing | Integration Point |
|---|---|---|---|
| **1. OpenRouter (Free Tier)** | `qwen/qwen-2.5-72b-instruct:free`<br>`qwen/qwen-2.5-coder-32b-instruct:free`<br>`qwen/qwen-2-7b-instruct:free` | $0 (Rate-limited, ~20 req/min) | Drop-in in `backend/app/services/openrouter_service.py` |
| **2. Hugging Face Serverless** | `Qwen/Qwen2.5-7B-Instruct`<br>`Qwen/Qwen2.5-Coder-7B-Instruct` | $0 (Free user token) | Direct update in `backend/app/services/llm_service.py` via `HF_LLM_MODEL` |
| **3. SiliconFlow (SiliconCloud)** | `Qwen/Qwen2.5-7B-Instruct`<br>`Qwen/Qwen2.5-Coder-7B` | $0 (Permanent free quota / daily credits) | OpenAI-compatible endpoint (`https://api.siliconflow.cn/v1`) |
| **4. GitHub Models (Azure AI)** | `Qwen-2.5-Coder-32B-Instruct`<br>`Qwen-2.5-72B-Instruct` | $0 (150 req/day per model with GitHub PAT) | OpenAI SDK compatible endpoint |
| **5. Cloudflare Workers AI** | `@cf/qwen/qwen1.5-7b-chat`<br>`@cf/qwen/qwen2.5-7b-instruct` | $0 (10,000 neurons/day) | REST API call from Vercel or Render |
| **6. WebLLM (In-Browser WebGPU)** | `Qwen2.5-0.5B`, `1.5B`, or `7B` (4-bit) | $0 (Runs 100% on client GPU) | Client-side `@mlc-ai/web-llm` in Next.js |
| **7. Google Colab / Kaggle + Tunnel** | `qwen2.5:7b` / `14b` via Ollama/vLLM | $0 (Free T4 16GB GPU) | Cloudflare Tunnel (`cloudflared`) public URL |



---

## 4. Head-to-Head Comparison: Cloudflare Workers AI vs. Hugging Face Serverless

| Feature | Hugging Face Serverless | Cloudflare Workers AI |
|---|---|---|
| **Cold Starts** | ⚠️ High (20s–50s, returns HTTP 503 while loading into serverless pool) | ✅ Negligible (~0s, warm global edge GPU clusters) |
| **Vercel 15s Timeout Risk** | ⚠️ High: If HF returns 503 and enters backoff loop, Vercel kills connection | ✅ Low: Instant edge responses fit comfortably inside 15s |
| **Current Qwen Models** | ✅ Latest `Qwen/Qwen2.5-7B-Instruct` & `Qwen2.5-Coder-7B` | ⚠️ Catalog restricted (primarily Qwen 1.5 variants or limited builds) |
| **Daily Free Quota** | Dynamic rate-limiting; no hard daily cap, but throttled during peak hours | Hard cap: 10,000 Neurons/day (~100–250 requests) resets daily |
| **Code Friction in `paper2project`** | **0% friction** — already implemented in `llm_service.py` | Low-to-Medium — requires new Cloudflare API client & tokens |
| **Embeddings & Reranking** | Supports `bge-large-en-v1.5` & `bge-reranker` (already in `.env.example`) | Limited to Cloudflare-supported embedding models |
