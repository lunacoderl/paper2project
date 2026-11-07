# Architecture Blueprint — Paper2Project

## System Architecture

```
                                  [Universal Client Input]
               (Text Prompt | TXT File | PDF Paper | DOCX Document | Document Image)
                                             │
                                             ▼
                               [Deep NLP Entity Extractor]
                (Extracts: Algorithms, Techniques, Methods, Functions, Tools)
                                             │
                                             ▼
                      [PRE-RETRIEVAL KEYWORD VERIFICATION MODAL]
                 (User inspects, refines, and validates extracted badges)
                                             │
                                             ▼
                          [Academic Graph Retrieval Engine]
              (Semantic Scholar Graph API + arXiv API + OpenAlex API)
                       Paginated Batches: 10 to 1,000 Papers
                                             │
                                             ▼
                           [NOVELTY & PERFORMANCE RANKER]
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
  [Priority 1: Custom ML Model]                                [Priority 2: AI / NLP Fallback]
  (e.g., LightGBM / ONNX / PyTorch)                            (Dual-Criterion Performance Scoring)
             │                                                               │
             └───────────────────────────────┬───────────────────────────────┘
                                             │
                                             ▼
                           [Client-Side Storage & Pagination]
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
  [Top 1-10 Ranked Papers Rendered]                               [All 10-1000 Stored in IndexedDB]
  - Rank (#1..#N), Match %, Accuracy %                            - Zero backend storage overhead
  - Datasets used, Matched keywords tags                          - "Load 10 More" pulls in 0ms
  - [<PaperDetailsModal /> Reusable JSON Viewer]
                                             │
                                             ▼
                         [Competitive Outperformance Engine]
                    (OpenRouter Free Tier / Hugging Face Serverless)
                    - Component-by-Component Upgrade vs. Validate
                    - Theoretical & Empirical Reasoning
                                             │
                                             ▼
                       [Hardware & Resource Questionnaire]
                   (PC Name, CPU, RAM, SSD, GPU, VRAM, Budget, Time)
                                             │
                                             ▼
                    [Scratch-to-100% Working Prototype Roadmap]
                                             │
                                             ▼
                           [Grounded Project Copilot (RAG)]
               (Isolated Knowledge: Source + Papers + Outperformance + Roadmap)
                       Strict Bracketed Citations [Source: ...]
```

## Data Storage Strategy
- **Supabase / PostgreSQL**: Stores minimal relational metadata and search session summaries.
- **Client-Side IndexedDB**: Stores the complete batch of 10 to 1,000 papers in JSON format, allowing fast local pagination and zero database bloat.
