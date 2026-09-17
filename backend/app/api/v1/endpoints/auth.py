"""
Auth endpoints — verify Firebase token and return user profile.
"""

from fastapi import APIRouter, Depends
from app.core.firebase import get_current_user
from app.schemas.user import UserPublic

router = APIRouter()


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserPublic = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return current_user
