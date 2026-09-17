"""
LLM Service — HuggingFace Inference API for text generation.
Provides structured output for project analysis, concept/feature extraction,
suggestion generation, copilot chat, and roadmap generation.
"""

import json
import logging
import asyncio
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)
HF_INFERENCE_URL = "https://api-inference.huggingface.co/models"


class LLMService:
    def __init__(self):
        self.model = settings.HF_LLM_MODEL
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    async def _generate(
        self,
        prompt: str,
        max_tokens: int = 1024,
        temperature: float = 0.3,
    ) -> str:
        """Raw text generation via HF Inference API."""
        url = f"{HF_INFERENCE_URL}/{self.model}"
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "do_sample": temperature > 0,
                "return_full_text": False,
            },
            "options": {"wait_for_model": True},
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(3):
                try:
                    response = await client.post(
                        url, headers=self.headers, json=payload
                    )
                    response.raise_for_status()
                    data = response.json()

                    if isinstance(data, list) and data:
                        return data[0].get("generated_text", "")
                    return str(data)

                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 503 and attempt < 2:
                        wait = (attempt + 1) * 15
                        logger.warning(f"Model loading, retry in {wait}s...")
                        await asyncio.sleep(wait)
                    else:
                        raise
                except Exception as e:
                    if attempt < 2:
                        await asyncio.sleep(5)
                    else:
                        raise

        return ""

    async def _generate_json(self, prompt: str, max_tokens: int = 2048) -> Dict:
        """Generate and parse a JSON response from the LLM."""
        json_prompt = prompt + "\n\nRespond ONLY with valid JSON, no explanation."
        raw = await self._generate(json_prompt, max_tokens=max_tokens, temperature=0.1)

        # Extract JSON from response
        try:
            # Try to find JSON block
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()

            return json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON: {e}\nRaw: {raw[:500]}")
            raise ValueError(f"LLM returned invalid JSON: {e}")

    # ─── Public Methods ───────────────────────────────────────────────────────

    async def analyze_project(self, content: str) -> Dict:
        """Extract structured understanding from project text/paper."""
        prompt = f"""You are an expert software architect and AI researcher.
Analyze the following project description or research paper and extract structured information.

PROJECT CONTENT:
{content[:4000]}

Extract and return JSON with this exact schema:
{{
  "project_title": "string",
  "summary": "2-3 sentence project summary",
  "problem_statement": "what problem this solves",
  "proposed_solution": "how it solves it",
  "target_users": ["list of target users"],
  "domains": ["list of technical domains, e.g. Computer Vision, NLP"],
  "concepts": [
    {{"concept_name": "string", "normalized_concept": "string", "description": "string", "importance_score": 0.9}}
  ],
  "features": [
    {{"feature_name": "string", "description": "string", "category": "core|ui|api|ai|data", "priority": "high|medium|low", "status": "existing|planned"}}
  ],
  "technologies": [
    {{"technology_name": "string", "category": "frontend|backend|ai_ml|database|cloud|devops", "purpose": "string", "confidence_score": 0.9}}
  ],
  "functional_requirements": ["list of functional requirements"],
  "non_functional_requirements": ["list of NFRs like scalability, performance"],
  "complexity": {{"score": 65, "level": "intermediate"}}
}}"""
        return await self._generate_json(prompt, max_tokens=3000)

    async def extract_concepts(self, content: str) -> List[Dict]:
        """Extract key technical concepts from content."""
        prompt = f"""Extract the top 10 technical concepts from this text.
Return JSON array: [{{"concept_name":"string","normalized_concept":"string","description":"string","importance_score":0.9}}]

TEXT: {content[:3000]}"""
        result = await self._generate_json(prompt)
        return result if isinstance(result, list) else result.get("concepts", [])

    async def generate_search_queries(self, project_context: Dict) -> List[str]:
        """Generate diverse search queries from project context."""
        prompt = f"""Generate 15 search queries to find similar projects/papers for:
Title: {project_context.get('project_title', '')}
Summary: {project_context.get('summary', '')}
Concepts: {', '.join(c.get('concept_name','') for c in project_context.get('concepts', [])[:5])}
Features: {', '.join(f.get('feature_name','') for f in project_context.get('features', [])[:5])}

Return JSON array of query strings covering: overall project, individual concepts, specific features, technology combinations."""
        result = await self._generate_json(prompt)
        return result if isinstance(result, list) else result.get("queries", [])

    async def analyze_result(self, project_context: Dict, result: Dict) -> Dict:
        """Analyze how a search result relates to the user's project."""
        prompt = f"""Compare this search result against the user's project and explain the relationship.

USER PROJECT:
Title: {project_context.get('project_title','')}
Summary: {project_context.get('summary','')}

SEARCH RESULT:
Title: {result.get('title','')}
Description: {result.get('description','')}[:1000]

Return JSON:
{{
  "summary": "2-sentence summary of the result",
  "matching_features": ["features that match"],
  "matching_concepts": ["concepts that match"],
  "technologies": ["technologies used"],
  "key_differences": ["how it differs from user project"],
  "reusable_ideas": ["ideas user can borrow"],
  "why_relevant": "one sentence explanation",
  "quality_score": 0.85
}}"""
        return await self._generate_json(prompt)

    async def generate_suggestions(self, project_context: Dict, similar_results: List[Dict]) -> List[Dict]:
        """Generate improvement suggestions based on gap analysis."""
        results_summary = "\n".join([
            f"- {r.get('title','')}: {r.get('description','')[:200]}"
            for r in similar_results[:5]
        ])
        prompt = f"""Analyze this project and suggest improvements based on similar projects.

USER PROJECT:
{project_context.get('summary','')}
Features: {', '.join(f.get('feature_name','') for f in project_context.get('features',[])[:8])}

SIMILAR PROJECTS FOUND:
{results_summary}

Generate 8 specific improvement suggestions. Return JSON array:
[{{
  "category": "feature|technical|ai_ml|ux|security|scalability|performance|research",
  "title": "short title",
  "description": "detailed description",
  "reason": "why this improvement matters",
  "impact": "high|medium|low",
  "difficulty": "easy|medium|hard",
  "estimated_time": "e.g. 2-3 days",
  "priority_score": 0.85
}}]"""
        result = await self._generate_json(prompt, max_tokens=3000)
        return result if isinstance(result, list) else result.get("suggestions", [])

    async def generate_roadmap(self, project_context: Dict, constraints: Dict) -> Dict:
        """Generate a phased implementation roadmap."""
        prompt = f"""Generate a detailed implementation roadmap.

PROJECT:
Title: {project_context.get('project_title','')}
Summary: {project_context.get('summary','')}
Features: {', '.join(f.get('feature_name','') for f in project_context.get('features',[])[:10])}
Technologies: {', '.join(t.get('technology_name','') for t in project_context.get('technologies',[])[:8])}
Complexity: {project_context.get('complexity',{}).get('level','intermediate')}

USER CONSTRAINTS:
Skill Level: {constraints.get('skill_level','intermediate')}
Hours/day: {constraints.get('available_hours_per_day',4)}
Team size: {constraints.get('team_size',1)}
Deadline (weeks): {constraints.get('deadline_weeks','flexible')}

Return JSON:
{{
  "total_duration_weeks": 12,
  "complexity_score": 65,
  "mvp_phases": [1, 2],
  "phases": [{{
    "phase_number": 1,
    "title": "Foundation",
    "goal": "Set up the project foundation",
    "duration_weeks": 2,
    "tasks": [{{
      "title": "Task title",
      "description": "What to do",
      "priority": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "estimated_hours": 8,
      "required_skills": ["Python", "FastAPI"],
      "dependencies": []
    }}],
    "deliverables": ["Working API server", "Database connected"]
  }}]
}}"""
        return await self._generate_json(prompt, max_tokens=4000)

    async def chat(
        self,
        project_context: Dict,
        conversation_history: List[Dict],
        user_message: str,
    ) -> Dict:
        """Conversational copilot response with optional action proposal."""
        history_text = "\n".join([
            f"{m['role'].upper()}: {m['content']}"
            for m in conversation_history[-10:]
        ])
        prompt = f"""You are an expert AI project assistant (Project Copilot).
You help users build their projects by answering questions and suggesting improvements.

PROJECT CONTEXT:
Title: {project_context.get('project_title','')}
Summary: {project_context.get('summary','')}
Features: {', '.join(f.get('feature_name','') for f in project_context.get('features',[])[:8])}
Technologies: {', '.join(t.get('technology_name','') for t in project_context.get('technologies',[])[:6])}

CONVERSATION HISTORY:
{history_text}

USER: {user_message}

Respond helpfully. If the user wants to modify the project (add/remove feature, change tech, etc.),
include an action_proposal. Return JSON:
{{
  "message": "your helpful response",
  "action_proposal": null | {{
    "action": "add_feature|remove_feature|update_requirement|change_technology",
    "title": "Action title",
    "description": "What will change",
    "data": {{}},
    "requires_confirmation": true
  }}
}}"""
        return await self._generate_json(prompt, max_tokens=1500)

    async def generate_architecture(self, project_context: Dict, diagram_type: str = "system") -> Dict:
        """Generate React Flow compatible architecture nodes and edges."""
        prompt = f"""Generate a {diagram_type} architecture diagram as React Flow data.

PROJECT:
Title: {project_context.get('project_title','')}
Technologies: {', '.join(t.get('technology_name','') for t in project_context.get('technologies',[])[:10])}
Features: {', '.join(f.get('feature_name','') for f in project_context.get('features',[])[:8])}

Return JSON with React Flow format:
{{
  "nodes": [{{
    "id": "unique-id",
    "type": "default",
    "position": {{"x": 100, "y": 100}},
    "data": {{"label": "Component Name", "category": "frontend|backend|database|ai|external"}}
  }}],
  "edges": [{{
    "id": "e1-2",
    "source": "node-id-1",
    "target": "node-id-2",
    "label": "REST API",
    "animated": false
  }}]
}}"""
        return await self._generate_json(prompt, max_tokens=3000)
