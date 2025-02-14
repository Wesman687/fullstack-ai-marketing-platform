from asset_processing_service.logger import logger
from datetime import datetime
from typing import Any, Dict, Optional
import aiohttp
from asset_processing_service.config import HEADERS, config
from asset_processing_service.models import Asset, AssetProcessingJob
import tiktoken



class ApiError(Exception):
    def __init__(self, message: str, status_code: int = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

async def fetch_jobs() -> list[AssetProcessingJob]:
    """Fetch jobs from the API and return the response."""
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    jobs = [AssetProcessingJob(**item) for item in data]
                    return jobs
                else:
                    logger.error(f"Error fetching jobs: {response.status}")
                    return []
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching jobs: {error}")
        return []
    

async def update_job_details(job_id: str, update_data: Dict[str, Any]) -> None:
    data = {**update_data, "lastHeartBeat": datetime.now().isoformat()}
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=HEADERS, json=data) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Error updating job details for job {job_id}: {error}")
        
        
async def update_job_heartbeat(job_id: str) -> None:
    data = {"lastHeartBeat": datetime.now().isoformat()}
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=HEADERS, json=data) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Error updating job heartbeat for job {job_id}: {error}")
                    
                    
async def fetch_asset(asset_id: str) -> Optional[Asset]:
    """Fetch asset from the API and return the response."""
    try:
        url = f"{config.API_BASE_URL}/asset?assetId={asset_id}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()                    
                    if data:
                        return Asset(**data)
                    else:
                        return None
                else:
                    logger.error(f"Error fetching asset: {response.status}")
                    return None
                
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching jobs: {error}")
        return []
    
async def fetch_asset_file(file_url: str) -> bytes:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url) as response:
                response.raise_for_status()
                return await response.read()
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching asset file: {error}")
        raise ApiError("Error fetching asset file", status_code=500)
    
async def update_asset_content(asset_id: str, content: str) -> None:
    data = {"content": content}
    try:
        encoding = tiktoken.encoding_for_model("gpt-4o")
        tokens = encoding.encode(content)
        token_count = len(tokens)
        
        update_data = {
            "content": content,
            "tokenCount": token_count,
        }        
        url = f"{config.API_BASE_URL}/asset?assetId={asset_id}"
        
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, headers=HEADERS, json=update_data) as response:
                response.raise_for_status()
                
    except aiohttp.ClientError as error:
        logger.error(f"Error updating asset content for asset {asset_id}: {error}")
        raise ApiError("Error updating asset content", status_code=500)
