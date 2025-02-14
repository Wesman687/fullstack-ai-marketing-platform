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
    
    
class Asset(BaseModel):
    id: str = Field(alias="id")
    projectId: str = Field(alias="projectId")
    title: str
    fileName: str = Field(alias="fileName")
    fileUrl: str = Field(alias="fileUrl")
    fileType: str = Field(alias="fileType")
    mimeType: str = Field(alias="mimeType")
    size: int
    content: str = Field(default="")
    tokenCount: int = Field(default=0)
    createdAt: datetime = Field(default_factory=datetime.now, alias="createdAt")
    updatedAt: datetime = Field(default_factory=datetime.now, alias="updatedAt")

