-- ==============================================================================
-- Paper2Project — Complete Supabase PostgreSQL + pgvector Database Schema
-- ==============================================================================

-- 1. Enable pgvector and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================================================
-- 2. Core Tables
-- ==============================================================================

-- Users Table (Synced from Firebase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, processing, ready, failed, archived
    project_type VARCHAR(100),
    complexity_level VARCHAR(50),      -- beginner, intermediate, advanced, expert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Raw Inputs Table
CREATE TABLE IF NOT EXISTS public.project_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    input_type VARCHAR(50) NOT NULL,    -- text, prompt, pdf, research_paper, docx, txt, other
    original_text TEXT,
    file_name VARCHAR(255),
    file_path TEXT,
    mime_type VARCHAR(100),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    project_input_id UUID REFERENCES public.project_inputs(id) ON DELETE SET NULL,
    title VARCHAR(255),
    document_type VARCHAR(50),
    raw_text TEXT,
    cleaned_text TEXT,
    language VARCHAR(20) DEFAULT 'en',
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Chunks for RAG (pgvector 1024 dimensions for bge-large)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT DEFAULT 0,
    embedding VECTOR(1024),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. Project Intelligence Tables
-- ==============================================================================

-- Project Analysis Table
CREATE TABLE IF NOT EXISTS public.project_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    problem_statement TEXT,
    proposed_solution TEXT,
    target_users JSONB DEFAULT '[]'::jsonb,
    project_domain VARCHAR(255),
    complexity_score INT DEFAULT 0,
    complexity_level VARCHAR(50),
    analysis_version INT DEFAULT 1,
    model_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Concepts Table
CREATE TABLE IF NOT EXISTS public.project_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    concept_name VARCHAR(255) NOT NULL,
    normalized_concept VARCHAR(255),
    description TEXT,
    importance_score FLOAT DEFAULT 0.5,
    embedding VECTOR(1024),
    parent_concept_id UUID REFERENCES public.project_concepts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Features Table
CREATE TABLE IF NOT EXISTS public.project_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium', -- high, medium, low
    complexity VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'planned',  -- existing, planned, suggested, removed
    embedding VECTOR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Technologies Table
CREATE TABLE IF NOT EXISTS public.project_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    technology_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),                  -- frontend, backend, database, ai_ml, cloud, auth, api, devops
    purpose TEXT,
    confidence_score FLOAT DEFAULT 0.8,
    status VARCHAR(50) DEFAULT 'planned'
);

-- ==============================================================================
-- 4. Search & Discovery Tables
-- ==============================================================================

-- Search Sessions Table
CREATE TABLE IF NOT EXISTS public.search_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
    total_results INT DEFAULT 0,
    processed_results INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Search Results Table
CREATE TABLE IF NOT EXISTS public.search_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_session_id UUID NOT NULL REFERENCES public.search_sessions(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    source VARCHAR(50) NOT NULL,            -- github, arxiv, openalex, semantic_scholar, papers_with_code
    source_type VARCHAR(50) NOT NULL,       -- repository, paper, dataset
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    raw_description TEXT,
    normalized_content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    duplicate_group VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Result Matches & Scores Table
CREATE TABLE IF NOT EXISTS public.result_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    search_result_id UUID NOT NULL REFERENCES public.search_results(id) ON DELETE CASCADE,
    semantic_score FLOAT DEFAULT 0,
    concept_score FLOAT DEFAULT 0,
    feature_score FLOAT DEFAULT 0,
    technology_score FLOAT DEFAULT 0,
    source_quality_score FLOAT DEFAULT 0,
    final_score FLOAT DEFAULT 0,
    match_explanation TEXT
);

-- ==============================================================================
-- 5. Suggestions / Improvements Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.project_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    category VARCHAR(50),                   -- feature, technical, ai_ml, ux, security, scalability, performance, research
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    impact VARCHAR(50) DEFAULT 'medium',    -- high, medium, low
    difficulty VARCHAR(50) DEFAULT 'medium',-- easy, medium, hard
    estimated_time VARCHAR(100),
    priority_score FLOAT DEFAULT 0.5,
    status VARCHAR(50) DEFAULT 'new',       -- new, accepted, rejected, implemented
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. Copilot Conversations & Messages
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Copilot Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,              -- user, assistant, system, tool
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. Roadmap & Tasks Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    total_duration_weeks INT DEFAULT 4,
    complexity_score INT DEFAULT 50,
    mvp_phases JSONB DEFAULT '[1]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    goal TEXT,
    duration_weeks INT DEFAULT 2,
    deliverables JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID NOT NULL REFERENCES public.roadmap_phases(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    difficulty VARCHAR(50) DEFAULT 'medium',
    estimated_hours INT DEFAULT 4,
    required_skills JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'todo',       -- todo, in_progress, done
    dependencies JSONB DEFAULT '[]'::jsonb
);

-- ==============================================================================
-- 8. Architecture Diagrams Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.architectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    diagram_type VARCHAR(50) DEFAULT 'system', -- system, data_flow, ai_pipeline, database
    graph_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. Performance Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_project_id ON public.document_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_concepts_project_id ON public.project_concepts(project_id);
CREATE INDEX IF NOT EXISTS idx_features_project_id ON public.project_features(project_id);
CREATE INDEX IF NOT EXISTS idx_search_session_project ON public.search_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_search_results_session ON public.search_results(search_session_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_project ON public.project_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_phase ON public.roadmap_tasks(phase_id);

-- Vector Cosine Similarity Index
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
