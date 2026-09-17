from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    projects,
    inputs,
    analysis,
    discover,
    suggestions,
    copilot,
    roadmap,
    architecture,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(inputs.router, prefix="/projects/{project_id}/inputs", tags=["Inputs"])
api_router.include_router(analysis.router, prefix="/projects/{project_id}/analysis", tags=["Analysis"])
api_router.include_router(discover.router, prefix="/projects/{project_id}/discover", tags=["Discovery"])
api_router.include_router(suggestions.router, prefix="/projects/{project_id}/suggestions", tags=["Suggestions"])
api_router.include_router(copilot.router, prefix="/projects/{project_id}/copilot", tags=["Copilot"])
api_router.include_router(roadmap.router, prefix="/projects/{project_id}/roadmap", tags=["Roadmap"])
api_router.include_router(architecture.router, prefix="/projects/{project_id}/architecture", tags=["Architecture"])
