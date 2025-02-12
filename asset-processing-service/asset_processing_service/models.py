from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

class AssetProcessingJob(BaseModel):
    id: str
    asset_id: str = Field(alias="assetId")
    status: Literal["created", "in_progress", "completed", "failed", "max_attempts_exceeded"]
    attempts: int
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    last_heartbeat: datetime = Field(alias="lastHeartBeat")
    error_message: Optional[str] = Field(default=None, alias="errorMessage")

