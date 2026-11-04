ANIL NEERUKONDA INSTITUTE OF TECHNOLOGY AND SCIENCES
(Affiliated to Andhra University)
SANGIVALASA, VISAKHAPATNAM - 531162
2023-2027

Paper2Project: An AI-Powered Research Intelligence Platform with Anchor-Bootstrapped Hybrid Retrieval, Novelty Prediction, and Implementation Roadmapping

                                                     Submitted By
           A23126552217                                           Marothu Deekshitha
           A23126552229                                           Pinninti Dileep
           A23126552246                                           Varadhi Bharath
           A23126552275                                           Neetipalli Laya Vardhan

In Partial Fulfilment of the award of the degree of
BACHELOR OF TECHNOLOGY
in the Dept. of
COMPUTER SCIENCE OF ENGINEERING (AI&ML)
Under the Guidance of
Dr. V. Tejaswini
Assistant Professor (CSE-AI&ML)



Project Guide
Reviewer1
Reviewer2

---

TABLE OF CONTENTS
1. Abstract
2. Introduction
3. Literature Survey
4. Problem Statement
5. Existing Solution and Its Limitations
   • 5.1 Existing Academic Research Discovery Workflow
   • 5.2 Technical Limitations
6. Proposed Solution
   • 6.1 Overview of the Proposed Framework
   • 6.2 Recommendation and Novelty Enforcement Approach
   • 6.3 Selected Novelty Evaluation Categories
   • 6.4 Expected Advantages
7. Methodology
   • 7.1 Literature Review and Gap Analysis
   • 7.2 Anchor Bootstrapping (Step 0)
   • 7.3 Hybrid Recommendation Architecture
   • 7.4 Multi-Dimensional Novelty Prediction
   • 7.5 Experimental Evaluation
8. System Architecture
   • 8.1 Overall Architecture
   • 8.2 Ingress and NLP Extraction Flow
   • 8.3 Multi-Agent Retrieval Orchestration
   • 8.4 Collaborative Filtering (CF) Citation Branch
   • 8.5 Content-Based Filtering (CBF) Semantic Branch
   • 8.6 Hybrid Scoring and Ranking Layer
   • 8.7 Model 3 Novelty Predictor and Gap Engine
   • 8.8 End-to-End System Workflow
9. Expected Input and Output
   • 9.1 Normal Requests and Expected Responses
   • 9.2 Edge / Adversarial Requests and Expected Responses
   • 9.3 Consolidated Test Scenarios
   • 9.4 Expected Evaluation Criteria
10. Conclusion and Future Work
11. References

---

1. Abstract

Converting academic research ideas and published literature into working, production-grade software implementations represents a persistent bottleneck across computer science education and engineering research. Students and developers routinely draft ambitious technical proposals but struggle with three systemic challenges: identifying how much of their idea already exists in prior literature, finding related papers through fragmented and rate-limited academic portals, and translating theoretical findings into practical software architectures with realistic budgets and timelines.

This project proposes Paper2Project, an AI-powered research intelligence platform that automates the transition from raw research ideas to deployable software implementations. The platform is built on a hybrid personalized scientific paper recommendation methodology adapted from Sakib et al. (IEEE Access, 2021) and extends it with an Anchor Bootstrapping mechanism designed to resolve the academic cold-start problem for unpublished student ideas. The proposed architecture integrates a Collaborative Filtering (CF) branch based on two-level co-citation and bibliographic coupling matrices computed via Jaccard graph similarity, and a Content-Based Filtering (CBF) branch based on dense cosine similarity using the bge-small-en-v1.5 transformer embedding model.

The system further incorporates Model 3: a Multi-Dimensional Novelty Predictor and Greenfield Classifier that evaluates proposals across Problem Novelty, Methodological Novelty, and Implementation Novelty dimensions. Rather than returning a single similarity score, Model 3 classifies individual project features into novel, partially_implemented, and fully_implemented states, dynamically identifies literature gaps, and generates competitive differentiators. The platform also generates interactive system architecture diagrams using React Flow and produces zero-cost implementation roadmaps tailored to student timelines and hardware constraints.

The proposed methodology includes multi-source literature retrieval from Semantic Scholar, OpenAlex, and arXiv with automatic HTTP 429 rate-limit failover, dense embedding-based retrieval, hybrid recommendation ranking, and systematic novelty testing. The system is evaluated using both normal and edge-case scenarios across biomedical AI, supply chain forecasting, and edge computing domains. The expected outcome is a structured research intelligence framework and evaluation methodology that enables students and developers to validate the novelty of their ideas, discover related literature, and produce actionable implementation plans.


2. Introduction

Large Language Models and AI-driven platforms have significantly expanded the ability of developers and researchers to explore academic literature, extract technical insights, and automate complex reasoning workflows. Research portals such as Semantic Scholar, arXiv, OpenAlex, and IEEE Xplore now index hundreds of millions of scientific manuscripts across every branch of computer science and engineering. Despite this unprecedented abundance of published knowledge, a persistent gap separates theoretical academic publications from functional, production-ready software implementations.

A typical student or developer workflow begins with manually querying one or more academic search portals using trial-and-error keyword combinations. The resulting paper lists are then skimmed for relevance, and the researcher attempts to manually extract whether their own proposal is genuinely novel or already implemented in prior work. This workflow is brittle, cognitively exhausting, and fundamentally imprecise. Synonymous technical terminologies cause missed seminal papers, surface-level keyword searches fail to detect deep methodological overlap, and published papers rarely provide the hardware constraints, dependency manifests, or milestone schedules required for practical implementation.

A particular challenge is the academic cold-start problem. Collaborative Filtering algorithms that leverage citation graphs to identify topographically related manuscripts require the input work to already reside within the citation network. An unpublished student idea has zero citations, rendering citation-graph-based recommendation completely inoperative. Conversely, pure Content-Based Filtering relying on generic language models suffers from semantic drift, recommending papers that share buzzwords but diverge in methodology and system design.

This project, titled "Paper2Project: An AI-Powered Research Intelligence Platform with Anchor-Bootstrapped Hybrid Retrieval, Novelty Prediction, and Implementation Roadmapping," proposes a structured automated solution to these challenges. The platform deconstructs a raw student proposal using NLP, computes dense transformer embeddings to discover the nearest published anchor paper, constructs a two-branch hybrid recommendation engine fusing Jaccard citation-graph similarity (CF) and semantic cosine similarity (CBF), and predicts multi-dimensional novelty through a calibrated scoring model.

The core contributions of this project include:

1. Anchor-Bootstrapped Hybrid Recommendation Pipeline that resolves the zero-citation cold-start problem by bridging unpublished proposals into the global scholarly citation graph.

2. Multi-Source Academic Retrieval Engine integrating Semantic Scholar, arXiv, and OpenAlex with automatic failover mechanisms to eliminate HTTP 429 rate-limiting failures.

3. Model 3 Multi-Dimensional Novelty Predictor that delivers calibrated Literature Overlap and Novelty percentages decomposed across Problem, Methodological, and Implementation axes.

4. Zero-Cost Software Roadmapping that translates validated research into interactive React Flow architectural diagrams, weekly development schedules, and strictly budget-governed implementation plans using free cloud tiers.


3. Literature Survey

Author / Year          | Dataset                              | Methodology                                                              | Key Findings                                                                                     | Limitations
---------------------- | ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -----------------------------------------------------------------------------------------------------------
[1] Sakib et al. (2021)| DBLP Computer Science Bibliography   | Hybrid recommendation combining contextual metadata with two-level       | Fusing citation topological co-occurrence with content metadata significantly improves           | Requires a pre-existing publication profile with citation history. Completely fails for
                       | (1.3M+ papers, citation links)       | co-citation and bibliographic coupling matrices via Jaccard similarity.  | Recall@K and Precision@K over isolated CF or CBF models.                                         | unpublished student ideas with zero citations.
[2] Xiao et al. (2023) | MTEB and multilingual retrieval       | Developed BGE (bge-small-en-v1.5), a lightweight dense transformer       | Achieved state-of-the-art retrieval accuracy with compact 384-dimensional vectors at a           | Focuses purely on semantic representation; does not evaluate citation topology or software
                       | corpuses                              | embedding model fine-tuned for dense retrieval and semantic similarity.  | fraction of the inference cost of large LLMs.                                                    | implementation feasibility.
[3] Beltagy et al.     | Semantic Scholar corpus               | Pre-trained BERT on full-text scientific articles using specialized       | Dramatically improved NLP performance on scientific NER, relation extraction, and                | Computationally heavy (110M+ parameters), vulnerable to OOM on consumer hardware, and
(2019)                 | (1.14M scientific papers)             | in-domain scientific vocabularies.                                       | sentence classification tasks.                                                                   | restricted to textual parsing without novelty quantification.
[4] Kang et al. (2018) | PeerRead Dataset                     | Investigated automated review prediction and feature extraction using    | Proved that linguistic patterns in abstracts correlate with academic acceptance and              | Binary acceptance classification only; provides no feature-by-feature greenfield tagging
                       | (14,700 scientific papers)            | deep neural networks applied to submission abstracts.                    | novelty is a primary decision driver.                                                            | or implementation roadmapping.
[5] Ammar et al. (2018)| Semantic Scholar Academic Graph       | Constructed an automated scholarly knowledge graph linking authors,       | Established global academic citation indexing and demonstrated graph-based entity                | Subject to severe API rate limits (HTTP 429); no cold-start ideation bridging for student
                       | (40M+ papers)                         | entities, venues, references, and citations at web scale.                | linking across heterogeneous academic literature.                                                | users.
[6] Priem et al. (2022)| OpenAlex Scholarly Knowledge Base     | Created a fully open, decentralized scientific index mapping works,       | Provides barrier-free REST APIs with high availability and unconstrained rate limits,            | Raw entity index without personalized project assessment, semantic idea matching, or
                       | (250M+ scientific works)              | concepts, authors, and open-access PDF repositories.                     | covering 250M+ scholarly works.                                                                  | technical novelty scoring.


4. Problem Statement

Academic research portals and recommendation systems are designed for retrospective exploration of published manuscripts, not prospective ideation support for unpublished technical proposals. When a student or developer drafts a new research idea, they face three fundamental barriers that existing tools cannot address.

First, citation-graph-based collaborative filtering algorithms — the most effective technique for identifying semantically related literature through topological proximity — require the input work to already exist within the scholarly citation network. An unpublished student idea has zero inbound citations and zero outbound references, causing graph-based recommendation to fail completely. Second, manually evaluating whether an idea is genuinely novel demands hours of dense literature reading. Existing tools return only monolithic similarity scores and cannot decompose novelty into distinct scientific dimensions or identify which specific sub-features are already solved versus which represent greenfield territory. Third, modern academic APIs enforce aggressive rate limits. Semantic Scholar's unauthenticated API tier returns HTTP 429 errors under moderate automated query loads, breaking retrieval pipelines and leaving users with empty candidate lists.

Therefore, this project addresses the following problem:

How can an automated research intelligence platform autonomously deconstruct an unpublished technical proposal, resolve the zero-citation cold-start barrier, perform hybrid citation-collaborative and semantic content-based literature retrieval, quantitatively predict multi-dimensional novelty, and synthesize actionable, zero-cost engineering roadmaps without dependency on expensive GPU infrastructure or brittle single-source API quotas?

To address this problem, the project proposes an integrated platform incorporating Anchor Bootstrapping (Step 0), a two-branch Sakib et al. (2021) hybrid recommendation engine, Model 3 multi-dimensional novelty scoring, feature greenfield classification, resilient multi-source API failover across OpenAlex and arXiv, and zero-cost implementation planning.


5. Existing Solution and Its Limitations

5.1 Existing Academic Research Discovery Workflow

Existing academic research portals and literature discovery tools provide keyword-based search over indexed paper databases. The workflow generally begins when a user enters a query on a portal such as Google Scholar, arXiv, or IEEE Xplore. The portal returns a ranked list of papers based on keyword match scores, citation counts, or publication recency. The researcher then manually reads abstracts, downloads relevant PDFs, and attempts to identify whether their proposal overlaps with prior work.

Developers attempting to implement a research idea typically return to internet search engines, GitHub repositories, and documentation pages to piece together a working software implementation. This approach relies entirely on manual effort, subjective judgment, and familiarity with the existing literature landscape.

However, conventional research discovery workflows primarily focus on information retrieval and do not address novelty quantification, citation-graph bridging for unpublished ideas, feature-level overlap detection, or engineering implementation planning. Security against API rate limits and reliable fallback across multiple scholarly sources are not considered.


5.2 Technical Limitations

The existing approach has several technical limitations:

1. Zero-Citation Cold-Start Penalty: Citation-graph collaborative filtering algorithms require a pre-existing publication record. An unpublished student idea has no node in the scholarly graph, completely precluding citation-matrix analysis.

2. Semantic Vocabulary Mismatch: Keyword-based search engines fail when authors describe identical concepts using different terminologies. Synonymous technical terms cause missed seminal papers and false negative results.

3. Absence of Quantitative Multi-Dimensional Novelty Modeling: Existing search engines rank papers by raw citation count or keyword match. They do not quantify how much of a proposed system is already solved, nor do they separate problem formulation novelty from algorithmic or deployment novelty.

4. Live API Rate Limits and Single-Point-of-Failure: Primary scholarly platforms like Semantic Scholar enforce tight rate limits on unauthenticated API access. Automated tools relying solely on Semantic Scholar frequently fail with HTTP 429 Too Many Requests errors.

5. Disconnect Between Research and Software Architecture: Academic publications optimize for theoretical proofs and benchmark percentages, systematically omitting software architecture diagrams, API schemas, dependency trees, and deployment manifests.

6. Prohibitive Computational Costs: Standard embedding solutions using full LLMs or large BERT models require dedicated GPU servers, rendering self-hosted literature intelligence unaffordable for students operating on zero budgets.

7. Static and Non-Actionable Literature Overviews: Traditional survey tools return a static list of bibliographic citations without contextualizing how each paper's methodology compares with the user's specific proposed features.

8. Lack of Explainable Feature-Level Greenfield Differentiation: When overlap is identified, existing systems cannot explain which specific feature is redundant and which remains genuine greenfield territory suitable for capstone differentiation or publication.

These limitations highlight the need for a dedicated research intelligence architecture that provides citation-graph bridging, hybrid multi-source retrieval, quantitative novelty measurement, feature-level classification, and zero-cost implementation planning.


6. Proposed Solution

6.1 Overview of the Proposed Framework

The proposed project, Paper2Project, aims to establish a structured research intelligence framework for automating the transition from unpublished student proposals to validated, production-ready software implementations. The framework addresses three primary challenges: resolving the academic cold-start problem, quantifying novelty across multiple scientific dimensions, and generating actionable zero-cost engineering roadmaps.

The proposed platform integrates multiple AI and retrieval mechanisms, including NLP-based concept extraction, dense transformer embeddings, Anchor Bootstrapping, citation-graph collaborative filtering, semantic content-based filtering, hybrid ranking, multi-dimensional novelty scoring, and interactive implementation planning. These mechanisms work together to provide an end-to-end automated pipeline from raw idea input to detailed software blueprint.

A central component of the framework is the Anchor Bootstrapping (Step 0) mechanism. Instead of relying on the student's unpublished idea to have existing citations, the system discovers the nearest published paper within the scholarly graph that shares the highest semantic similarity with the student's proposal. This anchor paper serves as a bridge, projecting the idea into the citation network and enabling full citation-graph collaborative filtering.

The framework also applies dynamic multi-source retrieval testing to evaluate how the system performs when primary API sources fail. Controlled rate-limit scenarios are introduced at Semantic Scholar to verify that automatic failover to OpenAlex and arXiv completes without user disruption.

6.2 Recommendation and Novelty Enforcement Approach

The proposed framework applies recommendation and novelty analysis controls at relevant stages of the research intelligence pipeline. Its enforcement approach consists of the following components:

1. NLP Deconstruction and Concept Extraction: The student's raw proposal text is analyzed to extract structured attributes including domain, key concepts, proposed methodologies, and feature specifications. This structured representation drives all subsequent retrieval and ranking operations.

2. Anchor Bootstrapping and Citation-Graph Bridging: Dense embeddings of the extracted proposal are compared against published scholarly papers to identify the nearest high-authority anchor paper. The anchor paper's citation footprint is used as a surrogate for the unpublished idea's position in the citation network.

3. Collaborative Filtering via Citation Co-Occurrence: The citation sets of the anchor paper and each candidate paper are compared using Jaccard similarity to compute a topological relatedness score. This score captures deep academic relevance independent of surface vocabulary.

4. Content-Based Filtering via Semantic Embedding: The proposal's dense vector is compared against each candidate paper's embedding using cosine similarity. This ensures alignment between the proposal's specific methodology and the retrieved literature.

5. Hybrid Ranking and Score Fusion: The CF and CBF scores are fused into a single hybrid ranking score. If no anchor paper is available, the system degrades gracefully to CBF-only ranking without crashing or returning empty results.

6. Multi-Dimensional Novelty Prediction and Feature Classification: Ranked candidate papers are analyzed against the proposal to compute calibrated Literature Overlap and Novelty percentages. Individual features are classified as novel, partially_implemented, or fully_implemented. Literature gaps and competitive advantages are dynamically extracted.

Together, these components provide coordinated research intelligence across the pipeline rather than depending on a single similarity computation at the retrieval stage.

6.3 Selected Novelty Evaluation Categories

The project focuses on ten selected novelty evaluation dimensions covering both domain-level and feature-level assessment.

S.No. | Novelty Dimension               | Description
------|----------------------------------|-----------------------------------------------------------------------------------------------
1     | Problem Novelty                  | Uniqueness of the target application domain and problem formulation compared to prior literature.
2     | Methodological Novelty           | Originality of the proposed algorithm, model architecture, or mathematical technique.
3     | Implementation Novelty           | Novelty of the engineering stack, software pipeline, and system integration approach.
4     | Data Pipeline Novelty            | Uniqueness of data preprocessing, multimodal ingestion, or streaming data handling.
5     | Architectural Novelty            | Innovation in system decomposition, microservices, or edge-cloud partitioning design.
6     | Hardware / Edge Novelty          | Feasibility of deploying models on resource-constrained consumer hardware without GPUs.
7     | Evaluation Novelty               | Introduction of multi-objective benchmarks or real-world stress tests beyond standard accuracy.
8     | Zero-Cost Feasibility            | Viability of executing the complete software lifecycle within zero-dollar cloud free tiers.
9     | Literature Gap Density           | Concentration of unresolved technical challenges identified in the top-ranked candidate papers.
10    | Greenfield Feature Ratio         | Percentage of proposed software features that have zero direct implementation precedents.

These categories provide the basis for developing calibrated novelty scores and mapping each proposed feature to the relevant scientific dimensions. The project evaluates novelty at both the proposal level and the individual feature level.

The selected categories define the project's evaluation scope; they do not represent an exhaustive list of all possible dimensions of academic novelty.

6.4 Expected Advantages

The proposed architecture is expected to provide the following advantages:

1. Cold-Start Elimination: Successfully retrieves topographically relevant candidate papers for unpublished student ideas via Anchor Bootstrapping, without requiring a pre-existing publication record.

2. Mathematically Calibrated Novelty: Eliminates subjective guesswork by delivering precise percentages for Literature Overlap and Novelty across multiple scientific dimensions.

3. Explainable Feature-Level Breakdown: Directly tags each proposed feature as novel, partially_implemented, or fully_implemented, highlighting exactly which sub-features require additional differentiation.

4. Zero-Downtime Retrieval Resilience: Tri-source query federation across Semantic Scholar, arXiv, and OpenAlex guarantees uninterrupted operation even during severe API rate limits.

5. Lightweight CPU-Native Inference: Uses bge-small-en-v1.5 (384-dimensional embeddings), requiring less than 500MB RAM and running in milliseconds on standard CPUs without GPU hardware.

6. Actionable Implementation Roadmaps: Generates week-by-week development schedules with clear deliverables, reducing project onboarding time from weeks to minutes.

7. Strict Zero-Cost Budget Governance: Assures students and educators that generated architectures operate entirely within free-tier limits on Vercel, Render, and Supabase.

8. Interactive Visual Architecture: Automatically produces interactive node-and-edge system flow diagrams powered by React Flow for student presentation and academic review.

9. Systematic Novelty Evaluation: Supports controlled testing of selected novelty categories at different levels of the research proposal.

These advantages represent the intended benefits of the proposed framework. Their actual effectiveness will be assessed through implementation and controlled evaluation. The project does not assume that the proposed architecture surpasses all existing industrial platforms; instead, it aims to identify its strengths, limitations, and potential improvements through experimental results.


7. Methodology

The methodology adopted for this project involves reviewing existing research, identifying retrieval and novelty gaps, designing a hybrid recommendation and novelty architecture, implementing the system, and evaluating its effectiveness across normal and edge-case scenarios. The approach focuses on understanding how unpublished ideas can be bridged into scholarly citation networks and how multi-dimensional novelty can be computed reliably across diverse technical domains.

7.1 Literature Review and Gap Analysis

The first stage involves reviewing research papers and existing studies related to scientific paper recommendation, dense neural text embeddings, citation graph analysis, NLP-based concept extraction, and academic novelty evaluation. The literature review helps identify existing approaches, known limitations, and potential gaps relevant to the project.

The study covers six research areas: hybrid CF/CBF academic recommendation (Sakib et al., 2021), lightweight dense retrieval embeddings (Xiao et al., 2023), scientific language model pre-training (Beltagy et al., 2019), peer review-based novelty assessment (Kang et al., 2018), large-scale scholarly graph construction (Ammar et al., 2018), and open academic index construction (Priem et al., 2022).

Based on the reviewed literature, the project identifies ten novelty evaluation dimensions and three technical gaps: the cold-start problem for unpublished ideas, the absence of multi-dimensional novelty quantification, and the brittleness of single-source academic API retrieval.

7.2 Anchor Bootstrapping (Step 0)

Anchor Bootstrapping resolves the academic cold-start problem. When a student submits an unpublished proposal, the system deconstructs its text into a structured representation and computes a 384-dimensional dense embedding vector using the bge-small-en-v1.5 transformer model.

This embedding is compared against candidate papers retrieved from scholarly sources using cosine similarity. The published paper that maximizes semantic similarity while possessing a non-empty citation network is selected as the Anchor Paper. The anchor paper's inbound citations and outbound references then serve as a surrogate citation footprint for the student's unpublished idea, projecting it directly into the global citation graph and enabling full citation-based collaborative filtering.

If no anchor paper with sufficient citations is found, the system automatically activates a CBF-only fallback pathway without raising an error or returning an empty response.

7.3 Hybrid Recommendation Architecture

Following anchor selection, the system executes a two-branch recommendation pipeline adapted from Algorithm 1 of Sakib et al. (2021).

The Collaborative Filtering branch extracts two-level citation relationships surrounding the anchor paper — the set of papers citing it and the set of papers it cites — and constructs a co-occurrence matrix. For each candidate paper, its citation sets are compared against the anchor's citation sets using Jaccard similarity to produce a CF recommendation score between 0.0 and 1.0.

The Content-Based Filtering branch simultaneously computes cosine similarity between the student's proposal embedding and each candidate paper's embedding to produce a CBF recommendation score between 0.0 and 1.0.

The final hybrid score is computed by fusing both branches. When an anchor paper is active, the hybrid score is the arithmetic mean of the CBF and CF scores. When no anchor is available, the hybrid score falls back to the CBF score alone. Candidate papers are ranked by hybrid score in descending order and the top-N results are forwarded to Model 3.

7.4 Multi-Dimensional Novelty Prediction

Model 3 accepts the student proposal and the top-ranked candidate papers and executes two operations.

First, it computes a multi-dimensional novelty assessment. The Literature Overlap Score is derived from a weighted combination of the maximum hybrid similarity among top candidates and the mean similarity across all candidates. The Overall Novelty Score is defined as 100% minus the Literature Overlap Score. Based on this value, the system assigns a qualitative verdict: High Novelty for scores above 75%, Moderate Novelty with Proven Precedents for scores between 40% and 75%, and Heavily Explored Area — Needs Differentiators for scores below 40%. Sub-scores are computed separately for Problem Novelty, Methodological Novelty, and Implementation Novelty.

Second, it classifies each proposed feature into one of three states. Features with a maximum similarity above 0.80 across candidate papers are classified as fully_implemented. Features with a maximum similarity between 0.50 and 0.80 are classified as partially_implemented. Features with a maximum similarity below 0.50 are classified as novel. The system then dynamically extracts literature gaps and generates competitive advantages from the identified novel features.

The analysis identifies the affected dimension, overlap score, feature classification, and actionable gap statement for each finding.

7.5 Experimental Evaluation

The final stage evaluates the proposed architecture using normal and edge-case test scenarios. The evaluation compares expected system behavior with observed outcomes and examines the effectiveness of the implemented recommendation and novelty analysis mechanisms.

The following metrics will be considered:

Evaluation Metric                | Purpose
---------------------------------|-----------------------------------------------------------------------------------------
Precision@K                      | Proportion of top-K recommended papers that directly relate to the student's project domain.
Recall@K                         | System's ability to discover all known seminal papers in the target domain.
Mean Reciprocal Rank (MRR)        | Position of the first truly seminal anchor paper in the retrieval ranking.
NDCG@K                           | Ranking quality accounting for graded relevance of matching literature.
Novelty Prediction MAE            | Accuracy of Model 3 novelty percentages compared to expert peer review assessments.
HTTP 429 Fallback Success Rate    | Whether automatic failover to OpenAlex and arXiv completes without user disruption.
Pipeline Latency                  | End-to-end execution time from raw input submission to full dashboard rendering.

Where feasible, the architecture will be compared with a clearly defined baseline under the same test conditions. The baseline configuration, test scenarios, and evaluation criteria will be documented to support reproducibility. Results will be analyzed to identify successful novelty detection, remaining gaps, false positives, and performance trade-offs.


8. System Architecture

The system architecture defines the components, data flows, and processing mechanisms required to support an AI-powered research intelligence platform. The proposed architecture integrates NLP extraction, dense embedding generation, anchor bootstrapping, citation-graph collaborative filtering, semantic content-based filtering, hybrid ranking, multi-dimensional novelty prediction, and zero-cost implementation planning.

The architecture follows the principle that novelty assessment should not rely solely on black-box LLM similarity guesses. Instead, citation topology and semantic alignment are computed separately via deterministic mathematical operations and then fused into a calibrated hybrid score. API resilience is enforced through automatic multi-source failover rather than depending on a single academic index.

8.1 Overall Architecture

The proposed system consists of several interconnected components responsible for processing student proposals, coordinating retrieval and ranking, assessing novelty, and generating implementation plans.

User Interface: Accepts raw project proposals through a web form or uploaded document and presents the final dashboard including novelty scores, ranked literature, feature classifications, architecture diagrams, and implementation roadmaps.

NLP Extraction Layer (Model 1): Parses and deconstructs the student's proposal into structured attributes including domain, key concepts, proposed methodologies, and feature specifications.

Dense Embedding Engine: Tokenizes the extracted representation and generates a 384-dimensional dense vector using the bge-small-en-v1.5 transformer model.

Multi-Source Retrieval Broker: Coordinates literature retrieval across Semantic Scholar, OpenAlex, and arXiv with automatic failover when HTTP 429 rate limits are encountered.

Anchor Bootstrapping Service (Step 0): Identifies the nearest published anchor paper with an active citation network and extracts its citation graph footprint.

Collaborative Filtering (CF) Branch: Applies Algorithm 1 from Sakib et al. (2021) to compute Jaccard citation co-occurrence similarity between the anchor paper and each candidate paper.

Content-Based Filtering (CBF) Branch: Computes cosine similarity between the student's embedding vector and each candidate paper's embedding.

Hybrid Ranker and Fusion Layer: Fuses CF and CBF scores into a single hybrid ranking score and produces the top-N ranked candidate list.

Model 3 Novelty Predictor: Computes Literature Overlap and Novelty percentages, generates sub-dimensional scores, classifies individual features, and extracts literature gaps and competitive advantages.

Persistence and Storage Layer: Stores project contexts, extracted embeddings, and novelty results in Supabase PostgreSQL with pgvector support.

Implementation Planner: Generates interactive React Flow architecture DAGs, weekly development schedules, technology stack matrices, and zero-cost deployment manifests.

These components work together to provide an end-to-end automated research intelligence pipeline. The architecture is designed to be adaptable to different research domains, although the specific retrieval queries and novelty thresholds must be configured according to the technical domain of each project.


    Fig 8.1 — Paper2Project System Architecture


8.2 Ingress and NLP Extraction Flow

The ingress layer represents the entry point through which student proposals and uploaded documents enter the system. Its primary responsibility is to parse raw input, extract structured metadata, and reduce ambiguity before downstream processing begins.

When a user submits a proposal, the ingestion service accepts plain text, PDF uploads parsed via PyMuPDF, or DOCX files parsed via python-docx. The NLP extraction model analyzes the cleaned text and identifies the project domain, key research concepts, proposed algorithmic methodologies, and granular feature specifications. This structured extraction eliminates vocabulary ambiguity and ensures that subsequent embedding, retrieval, and novelty operations target precisely the technical attributes of the student's proposal rather than its surface phrasing.

The ingress flow includes the following activities:

• Receiving and validating student proposal submissions.
• Parsing uploaded documents and cleaning extracted text.
• Identifying the research domain, key concepts, proposed methods, and feature list.
• Generating a structured proposal representation for downstream embedding and retrieval.
• Recording input metadata for session continuity.

NLP extraction does not assume complete accuracy for every proposal. Additional retrieval diversity controls and anchor bootstrapping at the next stage compensate for cases where extraction produces incomplete or ambiguous outputs.

8.3 Multi-Agent Retrieval Orchestration

The multi-source retrieval orchestrator coordinates the discovery of candidate literature by distributing queries across multiple academic API providers. Rather than relying on a single source, the orchestrator executes parallel or sequential queries to maximize coverage and resilience.

The proposed architecture includes three representative retrieval providers:

Semantic Scholar Agent: Queries the Semantic Scholar Academic Graph (200M+ papers) with structured search terms derived from the extracted proposal. Provides rich citation and reference trees.

OpenAlex Agent: Queries the OpenAlex open scholarly index (250M+ works) as the primary failover when Semantic Scholar returns HTTP 429 rate limit errors or empty responses.

arXiv Agent: Queries the arXiv preprint repository for cutting-edge AI and machine learning manuscripts not yet peer-reviewed but highly relevant for emerging research domains.

The orchestrator assigns retrieval tasks to these providers and merges deduplicated candidate lists. If Semantic Scholar returns an HTTP 429 status, the orchestrator automatically redirects the query to OpenAlex and arXiv without user disruption. Security controls — in the form of rate-limit monitoring and automatic failover — remain active throughout this process.

8.4 Collaborative Filtering (CF) Citation Branch

The CF branch executes Algorithm 1 from Sakib et al. (2021) to construct a two-level citation co-occurrence matrix for the anchor paper. For each candidate paper under evaluation, the CF service fetches its citation and reference sets and computes the Jaccard citation similarity score. This score measures the proportion of shared academic neighbors between the anchor paper and the candidate, capturing deep topological relatedness even when the papers use divergent vocabulary.

If no citations are available for a candidate paper, its CF score defaults to 0.0 and the hybrid ranker compensates by increasing the weight of the CBF score.

8.5 Content-Based Filtering (CBF) Semantic Branch

The CBF branch computes the dense cosine similarity between the student's proposal embedding vector and each candidate paper's embedding. This ensures that retrieved papers align directly with the specific problem domain and algorithmic approach of the student's proposal, independent of citation topology.

The bge-small-en-v1.5 model produces 384-dimensional embeddings at less than 15 milliseconds per inference on standard CPU hardware. This allows the CBF branch to process dozens of candidate papers within the latency budget of a single web request without requiring GPU acceleration.

8.6 Hybrid Scoring and Ranking Layer

The hybrid ranker computes the final recommendation score for each candidate paper by fusing the CBF and CF branch outputs. When an anchor paper is active and citation data is available, the hybrid score is the arithmetic mean of the CBF and CF scores. When no anchor paper is found or the anchor has zero citations, the hybrid score falls back to the CBF score alone.

Candidate papers are sorted by hybrid score in descending order. The top-N papers are deduplicated by DOI and title before being forwarded to Model 3 for novelty analysis.

8.7 Model 3 Novelty Predictor and Gap Engine

Model 3 synthesizes the top-N ranked candidate papers and the student's structured proposal into a comprehensive novelty assessment. It derives the Overall Novelty Score, computes sub-scores for Problem, Methodological, and Implementation novelty, evaluates individual feature classification states, and dynamically generates literature gaps and competitive differentiators.

The overlap computation weights the maximum candidate similarity more heavily than the mean similarity to ensure that a single highly overlapping paper appropriately reduces the novelty score. The resulting score and verdict are presented on the interactive project dashboard alongside annotated feature cards and gap summaries.

8.8 End-to-End System Workflow

The execution workflow follows thirteen discrete sequential stages:

1. User Submission: Student inputs raw project proposal via Next.js interface or document upload.
2. Text Normalization: Ingress service parses, cleans, and structures input text.
3. NLP Deconstruction: Model 1 extracts domain, concepts, methods, and feature specifications.
4. Dense Vectorization: bge-small-en-v1.5 generates 384-dimensional idea_vector.
5. Multi-Source Literature Query: Retrieval broker fetches candidate papers from Semantic Scholar, OpenAlex, and arXiv.
6. Step 0 Anchor Discovery: Anchor service identifies the nearest published anchor paper with active citations.
7. CF Graph Processing: Citation service extracts co-citation and bibliographic coupling matrix and computes Jaccard CF score.
8. CBF Semantic Processing: Semantic ranker computes dense cosine CBF score.
9. Hybrid Fusion and Ranking: Hybrid ranker normalizes and ranks top-N candidate papers.
10. Model 3 Novelty Prediction: Novelty predictor computes Literature Overlap, Novelty percentage, and sub-dimensional scores.
11. Feature Greenfield Classification: Classifies each feature as novel, partially_implemented, or fully_implemented.
12. Roadmap and Architecture Synthesis: Generates interactive React Flow architecture diagram and zero-cost implementation roadmap.
13. Dashboard Presentation: Client renders interactive tabs, novelty cards, feature matrix, literature gaps, and AI Copilot dialogue.


9. Expected Input and Output

9.1 Normal Requests and Expected Responses

9.1.1 Normal Request 1 — Biomedical AI (Brain Tumor Classification and Risk Assessment)

Input:
{
  "request_id": "REQ-001",
  "project_title": "Brain Tumor MRI Classification and Post-Diagnosis Clinical Risk Analyzer",
  "content": {
    "abstract": "We develop an automated platform to predict brain tumor malignancy from multi-modal MRI scans using deep convolutional neural networks and an automated risk analyzer that assesses post-diagnosis surgical complications and patient hazard scores.",
    "domain": "Medical Image Computing",
    "concepts": ["Magnetic Resonance Imaging", "Brain Neoplasm", "CNN", "Clinical Risk Stratification"],
    "features": [
      "DICOM MRI volumetric scan upload and preprocessing",
      "Tumor segmentation and 3-class histological classification",
      "Post-diagnosis surgical hazard scoring algorithm",
      "Interactive 3D tumor boundary visualization widget"
    ]
  }
}

Expected Output:
{
  "request_id": "REQ-001",
  "status": "success",
  "anchor_paper": {
    "title": "Brain Tumor Segmentation and Survival Prediction Using Deep Learning",
    "citation_count": 142,
    "similarity_to_idea": 0.884
  },
  "novelty_assessment": {
    "overall_novelty_score": 68,
    "literature_overlap_score": 32,
    "verdict": "Moderate Novelty with Proven Precedents",
    "dimensions": {
      "problem_novelty": 62.0,
      "methodological_novelty": 71.5,
      "implementation_novelty": 70.5
    },
    "feature_matrix": [
      { "feature": "DICOM MRI volumetric scan upload", "status": "fully_implemented" },
      { "feature": "Tumor segmentation and 3-class classification", "status": "fully_implemented" },
      { "feature": "Post-diagnosis surgical hazard scoring", "status": "novel" },
      { "feature": "Interactive 3D tumor boundary visualization", "status": "partially_implemented" }
    ],
    "literature_gaps": [
      "Existing MRI classification models do not calculate clinical hazard scores for post-surgical complications.",
      "Published benchmarks focus exclusively on slice accuracy rather than end-to-end diagnostic workflows."
    ]
  }
}

Expected Behavior: The system successfully anchors the proposal to BraTS literature, classifies core classification features as fully_implemented, recognizes the hazard scoring feature as novel, and produces a 68% Novelty Score.

---

9.1.2 Normal Request 2 — Supply Chain Forecasting (Food Demand Regression)

Input:
{
  "request_id": "REQ-002",
  "project_title": "Multi-Regressor Food Demand Forecasting with Perishable Spoilage Penalties",
  "content": {
    "abstract": "A predictive time-series forecasting engine utilizing gradient boosting and weather regressors to forecast retail meal demand while minimizing perishable food spoilage in institutional cafeterias.",
    "domain": "Applied Machine Learning and Operations Research",
    "concepts": ["Time Series Regression", "Food Waste Mitigation", "LightGBM", "Weather Regressors"],
    "features": [
      "Automated CSV telemetry ingestion for historical meal sales",
      "Exogenous weather and holiday calendar feature engineering",
      "Perishable spoilage dynamic loss function penalty",
      "Automated procurement purchase-order dispatch generator"
    ]
  }
}

Expected Output:
{
  "request_id": "REQ-002",
  "status": "success",
  "anchor_paper": {
    "title": "Time Series Forecasting and Modeling of Food Demand Supply Chain Based on Regressors Analysis",
    "citation_count": 95,
    "similarity_to_idea": 0.895
  },
  "novelty_assessment": {
    "overall_novelty_score": 74,
    "literature_overlap_score": 26,
    "verdict": "Moderate Novelty with Proven Precedents",
    "feature_matrix": [
      { "feature": "CSV telemetry ingestion", "status": "fully_implemented" },
      { "feature": "Weather and holiday feature engineering", "status": "fully_implemented" },
      { "feature": "Perishable spoilage dynamic loss function", "status": "novel" },
      { "feature": "Automated procurement dispatch generator", "status": "novel" }
    ],
    "literature_gaps": [
      "Existing regressors minimize symmetric RMSE rather than asymmetric financial penalties for perishable stockouts."
    ]
  }
}

Expected Behavior: Identifies the food demand anchor paper, fuses citation CF and semantic CBF scores, and flags the asymmetric spoilage penalty as a key novel feature.

---

9.1.3 Normal Request 3 — Edge Computing / IoT (LoRa Disaster Mesh Network)

Input:
{
  "request_id": "REQ-003",
  "project_title": "Decentralized LoRa Mesh Telemetry Network for Post-Disaster Search and Rescue",
  "content": {
    "abstract": "A zero-infrastructure decentralized mesh networking protocol over long-range LoRa 868MHz radios for tactical disaster relief, featuring opportunistic geographic packet routing and edge victim heartbeat triage.",
    "domain": "Wireless Sensor Networks and Embedded Systems",
    "concepts": ["LoRa", "Mesh Topology", "Disaster Response", "Opportunistic Routing"],
    "features": [
      "ESP32 firmware driver for SX1276 LoRa transceivers",
      "Opportunistic flood-limited geographic packet forwarding",
      "Offline encrypted victim distress message queue",
      "Android tactical map offline synchronization via Bluetooth LE"
    ]
  }
}

Expected Output:
{
  "request_id": "REQ-003",
  "status": "success",
  "novelty_assessment": {
    "overall_novelty_score": 79,
    "literature_overlap_score": 21,
    "verdict": "High Novelty",
    "feature_matrix": [
      { "feature": "ESP32 firmware for SX1276 LoRa", "status": "fully_implemented" },
      { "feature": "Opportunistic geographic packet forwarding", "status": "partially_implemented" },
      { "feature": "Offline encrypted victim message queue", "status": "novel" },
      { "feature": "Android tactical map via Bluetooth LE", "status": "novel" }
    ],
    "literature_gaps": [
      "Most emergency communication literature relies on cellular backhaul, failing in complete telecommunications blackouts."
    ]
  }
}

Expected Behavior: Correctly produces High Novelty (79%), highlighting the dual-radio bridge and encrypted offline queue as major differentiators over theoretical simulation papers.


9.2 Edge / Adversarial Requests and Expected Responses

9.2.1 Edge Request 1 — Zero-Citation Cold-Start Research Idea

Input:
{
  "request_id": "EDGE-001",
  "project_title": "Quantum Annealing for Dynamic Drone Swarm Acoustic Noise Cancellation in Urban Canyons",
  "content": {
    "abstract": "Applying D-Wave adiabatic quantum annealers to compute instantaneous phase-inverted anti-sound trajectories for hexacopter swarm formations navigating narrow metropolitan building canyons.",
    "domain": "Quantum Computing and Aeroacoustics",
    "concepts": ["Quantum Annealing", "QUBO Formulation", "Active Noise Control", "Drone Swarm"],
    "features": [
      "QUBO mapping for 3D acoustic destructive interference nodes",
      "Real-time D-Wave Leap API hybrid solver bridge",
      "Hexacopter rotor phase synchronization telemetry"
    ]
  }
}

Expected Output:
{
  "request_id": "EDGE-001",
  "status": "success_with_fallback",
  "anchor_paper": {
    "citation_count": 0,
    "cf_status": "disabled_zero_citations"
  },
  "recommendation_summary": {
    "fusion_mode": "cbf_only_fallback"
  },
  "novelty_assessment": {
    "overall_novelty_score": 91,
    "verdict": "High Novelty",
    "feature_matrix": [
      { "feature": "QUBO mapping for acoustic interference", "status": "novel" },
      { "feature": "D-Wave Leap API hybrid solver bridge", "status": "novel" },
      { "feature": "Hexacopter rotor phase synchronization", "status": "partially_implemented" }
    ]
  }
}

Expected Behavior: The system detects zero citations on candidate papers, automatically bypasses the citation graph matrix, applies pure CBF cosine similarity, and returns a 91% High Novelty score without runtime error or empty response.

---

9.2.2 Edge Request 2 — Saturated / Duplicate Domain Idea

Input:
{
  "request_id": "EDGE-002",
  "project_title": "Handwritten Digit Recognition Using CNNs on MNIST",
  "content": {
    "abstract": "We construct a classical 2D convolutional neural network with two convolutional layers, max pooling, and a dense softmax output to classify handwritten digits 0 through 9 on the MNIST dataset.",
    "concepts": ["MNIST", "LeNet-5", "Convolutional Layer", "Softmax Classification"],
    "features": [
      "Loading 28x28 grayscale MNIST images",
      "Two Conv2D layers with ReLU activations",
      "Categorical cross-entropy loss with Adam optimizer",
      "Displaying training accuracy and confusion matrix"
    ]
  }
}

Expected Output:
{
  "request_id": "EDGE-002",
  "status": "success",
  "novelty_assessment": {
    "overall_novelty_score": 12,
    "literature_overlap_score": 88,
    "verdict": "Heavily Explored Area — Needs Differentiators",
    "feature_matrix": [
      { "feature": "Loading 28x28 MNIST images", "status": "fully_implemented" },
      { "feature": "Two Conv2D layers with ReLU", "status": "fully_implemented" },
      { "feature": "Cross-entropy with Adam optimizer", "status": "fully_implemented" },
      { "feature": "Training accuracy and confusion matrix", "status": "fully_implemented" }
    ],
    "literature_gaps": [
      "The proposed approach contains zero novel contributions. To achieve academic validity, introduce adversarial robustness testing, edge quantization, or few-shot domain transfer."
    ]
  }
}

Expected Behavior: The system detects overwhelming literature overlap (88%), marks all features as fully_implemented, and advises the student on necessary differentiators to achieve academic validity.

---

9.2.3 Edge Request 3 — Multi-Source Rate Limit and API Failover

Input:
{
  "request_id": "EDGE-003",
  "project_title": "Federated Differential Privacy for Decentralized Electronic Health Record Analytics",
  "simulated_environment": {
    "semantic_scholar_status": 429,
    "openalex_status": 200,
    "arxiv_status": 200
  },
  "content": {
    "abstract": "A privacy-preserving federated machine learning framework enabling cross-hospital training on partitioned electronic health records enforced through Renyi differential privacy.",
    "concepts": ["Federated Learning", "Differential Privacy", "Electronic Health Records"],
    "features": [
      "Decentralized model aggregation using FedAvg",
      "Client-side Gaussian noise perturbation mechanism",
      "Privacy budget accountant tracking epsilon-delta dissipation",
      "Interactive hospital dashboard for convergence monitoring"
    ]
  }
}

Expected Output:
{
  "request_id": "EDGE-003",
  "status": "success_resilient_failover",
  "telemetry": {
    "semantic_scholar_response": "HTTP 429: Too Many Requests",
    "failover_triggered": true,
    "secondary_provider_used": "OpenAlex REST API and arXiv Search",
    "failover_latency_ms": 142
  },
  "novelty_assessment": {
    "overall_novelty_score": 71,
    "verdict": "Moderate Novelty with Proven Precedents",
    "feature_matrix": [
      { "feature": "FedAvg model aggregation", "status": "fully_implemented" },
      { "feature": "Gaussian noise perturbation", "status": "fully_implemented" },
      { "feature": "Privacy budget accountant", "status": "partially_implemented" },
      { "feature": "Interactive hospital convergence dashboard", "status": "novel" }
    ]
  }
}

Expected Behavior: The retrieval broker intercepts the HTTP 429 error from Semantic Scholar, automatically switches to OpenAlex and arXiv, completes hybrid ranking and Model 3 novelty prediction, and returns complete analysis results with less than 200ms additional latency.


9.3 Consolidated Test Scenarios

The following table summarizes the six test cases used to describe the expected behavior of the proposed architecture.

Test ID   | Request Type | Category                        | Scenario                                              | Expected Decision
----------|-------------|----------------------------------|-------------------------------------------------------|----------------------------
REQ-001   | Normal      | Biomedical AI                    | Brain tumor MRI classification with risk scoring      | Allow — 68% Novelty, hazard scoring flagged novel
REQ-002   | Normal      | Time-Series Forecasting          | Food demand forecasting with spoilage penalties       | Allow — 74% Novelty, spoilage loss flagged novel
REQ-003   | Normal      | Edge Computing and IoT           | LoRa mesh network for disaster relief                 | Allow — 79% High Novelty, dual-radio bridge flagged novel
EDGE-001  | Edge        | Zero-Citation Cold-Start         | Quantum annealing for urban drone noise cancellation  | Protected Fallback — CBF-only, 91% High Novelty, no crash
EDGE-002  | Edge        | Saturated Academic Domain        | Vanilla LeNet-5 CNN on MNIST                          | Warning — 88% Overlap, all features fully_implemented
EDGE-003  | Edge        | Multi-Source API Resilience       | Semantic Scholar returns HTTP 429                     | Resilient Failover — OpenAlex and arXiv used, 0% data loss

9.4 Expected Evaluation Criteria

The system will be evaluated by submitting normal and edge-case requests and comparing the observed behavior with the expected novelty assessments and system decisions.

The primary evaluation criteria are:

1. Cold-Start Retrieval Robustness: Whether the system successfully retrieves topographically relevant papers for unpublished student proposals via Anchor Bootstrapping without raising exceptions.

2. Hybrid Scoring Precision: Whether fusing citation Jaccard similarity (CF) with dense semantic cosine similarity (CBF) improves candidate paper ranking accuracy compared to single-branch baselines.

3. Calibrated Novelty Quantification: Whether Model 3 outputs bounded, calibrated percentages for Literature Overlap and Novelty across diverse technical disciplines.

4. Feature-Level Granularity: Whether the greenfield classifier accurately distinguishes novel, partially_implemented, and fully_implemented sub-features rather than producing a monolithic score.

5. High-Availability API Resilience: Whether automated failover between Semantic Scholar, OpenAlex, and arXiv ensures uninterrupted operation despite third-party HTTP 429 throttling.

6. Zero-Cost Budget Compliance: Whether generated implementation roadmaps operate strictly within zero-dollar free cloud and local execution tiers.

7. Execution Latency and Efficiency: Whether dense embedding and ranking operations complete in under 1.5 seconds on standard multi-core consumer CPUs without GPU hardware.

The expected outputs in this section define the intended behavior of the proposed architecture. Actual novelty prediction accuracy, false-positive rates, and other performance measurements must be obtained through implementation and testing rather than assumed in advance.


10. Conclusion and Future Work

The increasing adoption of AI-driven research platforms introduces an opportunity to significantly reduce the time and expertise required to validate a research idea, discover relevant literature, and plan a software implementation. Addressing the academic cold-start problem, multi-dimensional novelty quantification, and API rate-limit brittleness is essential for enabling effective research intelligence at the student and independent developer level.

This project proposes Paper2Project, an AI-powered research intelligence platform that automates scientific paper discovery, novelty assessment, and implementation roadmapping for unpublished technical proposals. The platform integrates Anchor Bootstrapping to resolve the zero-citation cold-start barrier, a hybrid Sakib et al. (2021) CF and CBF recommendation engine to rank candidate literature, and Model 3 to deliver multi-dimensional novelty scores and feature-level greenfield classifications. A resilient multi-source retrieval broker across Semantic Scholar, OpenAlex, and arXiv ensures continuous operation under severe API rate limits.

A key aspect of the proposed approach is the mathematical separation between citation-graph collaborative filtering and semantic content-based filtering, fused only at the final ranking stage. This separation ensures that novelty assessments are grounded in verifiable topological and semantic evidence rather than opaque generative model guesses. Overall, this architecture provides a foundation for developing and evaluating AI-powered research intelligence tools while maintaining transparency, explainability, and zero-cost accessibility for student researchers.

Future Work

Subsequent iterations of Paper2Project will focus on four technical directions:

1. On-Device Small Language Model Integration: Investigating quantized local language models such as Llama-3-8B-Instruct or Mistral-7B via Ollama to enable completely offline NLP extraction and copilot guidance in air-gapped laboratory environments.

2. Automated Repository Generation: Extending the implementation roadmap engine to synthesize scaffolded GitHub repositories with starter code, Dockerfiles, unit tests, and CI/CD pipelines matching the validated project architecture.

3. Graph Neural Network Citation Embeddings: Exploring Graph Convolutional Networks and Graph Attention Networks applied directly on local subgraphs of Semantic Scholar to learn higher-order paper embeddings beyond the two-level co-citation matrices used in the current architecture.

4. Institutional Capstone and Peer Review Integration: Developing administrative dashboards for university faculty and capstone review committees to automatically verify student submission originality, track milestone completions, and detect unintentional overlap with existing literature prior to final grading.


11. References

[1] Nazmus Sakib, Rodina Ahmad, Mominul Ahsan et al. (2021) — Hybrid Paper Recommendation
A Hybrid Personalized Scientific Paper Recommendation Approach Integrating Public Contextual Metadata
IEEE Access, vol. 9, pp. 83080–83091
ReadPaper: https://doi.org/10.1109/ACCESS.2021.3086915

[2] Shitao Xiao, Zheng Liu, Peitian Zhang, Niklas Muennighoff (2023) — BGE Dense Embeddings
C-Pack: Packaged Resources to Advance General Chinese and English Embedding Capabilities
arXiv preprint arXiv:2309.07597
ReadPaper: https://arxiv.org/abs/2309.07597

[3] Iz Beltagy, Kyle Lo, Arman Cohan (2019) — SciBERT
SciBERT: A Pretrained Language Model for Scientific Text
EMNLP 2019, Hong Kong, pp. 3615–3620
ReadPaper: https://doi.org/10.18653/v1/D19-1371

[4] Daniel Kang, Waleed Ammar, Bhavana Dalvi et al. (2018) — PeerRead Dataset
A Dataset of Peer Reviews (PeerRead): Collection, Insights and NLP Applications
NAACL 2018, New Orleans, pp. 1261–1272
ReadPaper: https://doi.org/10.18653/v1/N18-1115

[5] Waleed Ammar, Dirk Groeneveld, Chandra Bhagavatula et al. (2018) — Semantic Scholar
Construction of the Literature Graph in Semantic Scholar
NAACL 2018, New Orleans, pp. 84–91
ReadPaper: https://doi.org/10.18653/v1/N18-3011

[6] Jason Priem, Heather Piwowar, Richard Orr (2022) — OpenAlex
OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts
arXiv preprint arXiv:2205.01833
ReadPaper: https://arxiv.org/abs/2205.01833
