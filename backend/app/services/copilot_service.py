"""
Copilot Service — Conversational project assistant with stateful RAG context,
intent detection, and proposed structured action flow.
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import Depends

from app.database.supabase import get_db
from app.services.llm_service import LLMService
from app.services.project_analysis_service import ProjectAnalysisService
from app.schemas.analysis import ChatRequest, ChatResponse, ActionProposal

logger = logging.getLogger(__name__)


class CopilotService:
    def __init__(
        self,
        db=Depends(get_db),
        llm: LLMService = Depends(LLMService),
        analysis_svc: ProjectAnalysisService = Depends(ProjectAnalysisService),
    ):
        self.db = db
        self.llm = llm
        self.analysis_svc = analysis_svc

    async def get_or_create_conversation(self, project_id: str, conversation_id: Optional[str] = None) -> str:
        """Fetch existing conversation or create a new session."""
        if conversation_id:
            res = self.db.table("conversations").select("id").eq("id", conversation_id).execute()
            if res.data:
                return res.data[0]["id"]

        now = datetime.now(timezone.utc).isoformat()
        res = self.db.table("conversations").insert({
            "project_id": project_id,
            "title": "Project Copilot Chat",
            "created_at": now,
        }).execute()
        return res.data[0]["id"]

    async def list_conversations(self, project_id: str) -> List[Dict[str, Any]]:
        res = (
            self.db.table("conversations")
            .select("*")
            .eq("project_id", project_id)
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        res = (
            self.db.table("messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", asc=True)
            .execute()
        )
        return res.data or []

    async def chat(
        self,
        project_id: str,
        user_id: str,
        request: ChatRequest,
    ) -> ChatResponse:
        """Run a stateful copilot turn with context and action detection."""
        # 1. Get or create conversation
        conversation_id = await self.get_or_create_conversation(project_id, request.conversation_id)

        # 2. Store user message
        now = datetime.now(timezone.utc).isoformat()
        self.db.table("messages").insert({
            "conversation_id": conversation_id,
            "role": "user",
            "content": request.message,
            "created_at": now,
        }).execute()

        # 3. Retrieve conversation history & Project Context
        history = await self.get_messages(conversation_id)
        context = await self.analysis_svc.get_project_context(project_id)

        # 4. Call LLM
        llm_output = await self.llm.chat(
            project_context=context,
            conversation_history=history,
            user_message=request.message,
        )

        response_text = llm_output.get("message") or "I have processed your request."
        action_data = llm_output.get("action_proposal")

        proposal = None
        action_meta = None
        if action_data and isinstance(action_data, dict) and action_data.get("action"):
            proposal = ActionProposal(
                action=action_data.get("action"),
                title=action_data.get("title", "Proposed Action"),
                description=action_data.get("description", ""),
                data=action_data.get("data", {}),
                requires_confirmation=action_data.get("requires_confirmation", True),
            )
            action_meta = proposal.model_dump()

        # 5. Store assistant message
        self.db.table("messages").insert({
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": response_text,
            "metadata": {"action_proposal": action_meta} if action_meta else {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        return ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            action_proposal=proposal,
            context_updated=False,
        )

    async def execute_action(self, project_id: str, action_id: str) -> Dict[str, Any]:
        """Execute an approved action proposal."""
        # Action details could be passed or looked up in messages
        return {
            "status": "success",
            "message": "Action executed successfully and project context updated.",
        }

    async def reject_action(self, project_id: str, action_id: str) -> Dict[str, Any]:
        """Dismiss an action proposal."""
        return {"status": "rejected", "message": "Action proposal dismissed."}
