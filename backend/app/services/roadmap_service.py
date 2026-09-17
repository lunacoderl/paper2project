"""
Roadmap Service — Personalised MVP scoping, phase generation,
task estimation, dependency ordering, and tracking.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.project_analysis_service import ProjectAnalysisService
from app.schemas.analysis import RoadmapResponse, RoadmapPhase, RoadmapTask

logger = logging.getLogger(__name__)


class RoadmapService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        analysis_svc: ProjectAnalysisService = Depends(ProjectAnalysisService),
    ):
        self.db = db
        self.llm = llm
        self.analysis_svc = analysis_svc

    async def generate(self, project_id: str, constraints: Dict[str, Any]) -> RoadmapResponse:
        """Generate a structured implementation roadmap tailored to user constraints."""
        context = await self.analysis_svc.get_project_context(project_id)
        if not context:
            raise ValueError("Project context is missing. Analyze project first.")

        # Generate roadmap via LLM
        raw_roadmap = await self.llm.generate_roadmap(context, constraints)

        total_duration = raw_roadmap.get("total_duration_weeks", 8)
        complexity_score = raw_roadmap.get("complexity_score", 50)
        mvp_phases = raw_roadmap.get("mvp_phases", [1, 2])
        raw_phases = raw_roadmap.get("phases", [])

        # Store roadmap in Supabase
        now = datetime.now(timezone.utc).isoformat()
        roadmap_payload = {
            "project_id": project_id,
            "total_duration_weeks": total_duration,
            "complexity_score": complexity_score,
            "mvp_phases": mvp_phases,
            "created_at": now,
        }

        # Clear old roadmap records for this project
        self.db.table("roadmaps").delete().eq("project_id", project_id).execute()

        res = self.db.table("roadmaps").insert(roadmap_payload).execute()
        roadmap_id = res.data[0]["id"]

        structured_phases: List[RoadmapPhase] = []

        for p_idx, p in enumerate(raw_phases):
            phase_payload = {
                "roadmap_id": roadmap_id,
                "project_id": project_id,
                "phase_number": p.get("phase_number", p_idx + 1),
                "title": p.get("title", f"Phase {p_idx + 1}"),
                "goal": p.get("goal", ""),
                "duration_weeks": p.get("duration_weeks", 2),
                "deliverables": p.get("deliverables", []),
            }
            phase_res = self.db.table("roadmap_phases").insert(phase_payload).execute()
            phase_id = phase_res.data[0]["id"]

            tasks_for_phase: List[RoadmapTask] = []
            for t in p.get("tasks", []):
                task_payload = {
                    "phase_id": phase_id,
                    "project_id": project_id,
                    "title": t.get("title", "Task"),
                    "description": t.get("description", ""),
                    "priority": t.get("priority", "medium"),
                    "difficulty": t.get("difficulty", "medium"),
                    "estimated_hours": t.get("estimated_hours", 4),
                    "required_skills": t.get("required_skills", []),
                    "status": "todo",
                    "dependencies": t.get("dependencies", []),
                }
                task_res = self.db.table("roadmap_tasks").insert(task_payload).execute()
                t_obj = task_res.data[0]
                tasks_for_phase.append(RoadmapTask(
                    id=t_obj["id"],
                    title=t_obj["title"],
                    description=t_obj.get("description"),
                    priority=t_obj.get("priority", "medium"),
                    difficulty=t_obj.get("difficulty", "medium"),
                    estimated_hours=t_obj.get("estimated_hours", 4),
                    required_skills=t_obj.get("required_skills", []),
                    status=t_obj.get("status", "todo"),
                    dependencies=t_obj.get("dependencies", []),
                ))

            structured_phases.append(RoadmapPhase(
                id=phase_id,
                phase_number=phase_payload["phase_number"],
                title=phase_payload["title"],
                goal=phase_payload["goal"],
                duration_weeks=phase_payload["duration_weeks"],
                tasks=tasks_for_phase,
                deliverables=phase_payload["deliverables"],
            ))

        return RoadmapResponse(
            id=roadmap_id,
            project_id=project_id,
            total_duration_weeks=total_duration,
            complexity_score=complexity_score,
            mvp_phases=mvp_phases,
            phases=structured_phases,
            created_at=datetime.fromisoformat(now),
        )

    async def get_latest(self, project_id: str) -> Optional[RoadmapResponse]:
        """Fetch the current roadmap with all phases and tasks."""
        roadmap_res = (
            self.db.table("roadmaps")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not roadmap_res.data:
            return None

        r = roadmap_res.data[0]
        roadmap_id = r["id"]

        phases_res = (
            self.db.table("roadmap_phases")
            .select("*")
            .eq("roadmap_id", roadmap_id)
            .order("phase_number", asc=True)
            .execute()
        )

        phases: List[RoadmapPhase] = []
        for p in phases_res.data or []:
            tasks_res = (
                self.db.table("roadmap_tasks")
                .select("*")
                .eq("phase_id", p["id"])
                .execute()
            )
            tasks = [RoadmapTask(**t) for t in tasks_res.data or []]
            phases.append(RoadmapPhase(
                id=p["id"],
                phase_number=p["phase_number"],
                title=p["title"],
                goal=p.get("goal", ""),
                duration_weeks=p.get("duration_weeks", 1),
                tasks=tasks,
                deliverables=p.get("deliverables", []),
            ))

        return RoadmapResponse(
            id=r["id"],
            project_id=project_id,
            total_duration_weeks=r.get("total_duration_weeks", 4),
            complexity_score=r.get("complexity_score", 50),
            mvp_phases=r.get("mvp_phases", []),
            phases=phases,
        )

    async def update_task_status(self, task_id: str, status: str) -> Dict[str, Any]:
        """Update task status (todo, in_progress, done)."""
        res = self.db.table("roadmap_tasks").update({"status": status}).eq("id", task_id).execute()
        return {"status": "updated", "task": res.data[0] if res.data else None}
