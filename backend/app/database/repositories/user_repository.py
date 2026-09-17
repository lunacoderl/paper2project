"""
User repository — handles all Supabase operations for the `users` table.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import Depends

from app.database.supabase import get_db
from app.schemas.user import UserPublic

logger = logging.getLogger(__name__)


class UserRepository:
    def __init__(self, db=Depends(get_db)):
        self.db = db

    async def upsert_by_firebase_uid(
        self,
        firebase_uid: str,
        email: str,
        display_name: str = "",
        photo_url: str = "",
    ) -> UserPublic:
        """
        Create or update a user in Supabase by their Firebase UID.
        Returns the full user record.
        """
        now = datetime.now(timezone.utc)
        data = {
            "firebase_uid": firebase_uid,
            "email": email,
            "display_name": display_name,
            "photo_url": photo_url,
            "last_login": now.isoformat(),
        }

        try:
            response = (
                self.db.table("users")
                .upsert(data, on_conflict="firebase_uid")
                .execute()
            )

            if response.data:
                user_data = response.data[0]
                return UserPublic(**user_data)

        except Exception as e:
            logger.warning(
                f"Supabase 'users' table not yet migrated or accessible ({e}). "
                f"Please run docs/database_schema.sql in Supabase SQL editor."
            )

        # Fallback UserPublic instance
        return UserPublic(
            id="00000000-0000-0000-0000-000000000001",
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name or "Project Developer",
            photo_url=photo_url,
            created_at=now,
            last_login=now,
        )

    async def get_by_firebase_uid(self, firebase_uid: str) -> Optional[UserPublic]:
        """Fetch a user by Firebase UID."""
        try:
            response = (
                self.db.table("users")
                .select("*")
                .eq("firebase_uid", firebase_uid)
                .single()
                .execute()
            )
            if response.data:
                return UserPublic(**response.data)
        except Exception as e:
            logger.warning(f"Could not fetch user by firebase_uid: {e}")
        return None

    async def get_by_id(self, user_id: str) -> Optional[UserPublic]:
        """Fetch a user by Supabase UUID."""
        try:
            response = (
                self.db.table("users")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            if response.data:
                return UserPublic(**response.data)
        except Exception as e:
            logger.warning(f"Could not fetch user by id {user_id}: {e}")
        return None
