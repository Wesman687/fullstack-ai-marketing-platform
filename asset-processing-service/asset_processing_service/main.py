import asyncio
from collections import defaultdict
from datetime import datetime
from time import sleep
from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import Config
from asset_processing_service.job_processor import process_job
from asset_processing_service.logger import logger


async def job_fetcher(
        job_queue: asyncio.Queue,
        jobs_pending_or_in_progress: set):

    while True:
        try:
            logger.info("Fetching job...")
            jobs = await fetch_jobs()        
            for job in jobs: # ✅ Proper async queueing            
                current_time = datetime.now().timestamp()     
                logger.info(f"Current time: {current_time}")
                if job.status == "in_progress" and job.last_heartbeat:
                    last_heartbeat = job.last_heartbeat.timestamp()             
                    time_since_last_heartbeat = abs(current_time - last_heartbeat)  
                    logger.info(f"Time since last heartbeat for job {job.id}: {time_since_last_heartbeat} seconds")    
                              
                    if time_since_last_heartbeat > Config.STUCK_JOB_THRESHOLD_SECONDS:
                        logger.info(f"Job {job.id} is stuck, Failing job.")
                        await update_job_details(job.id,{                            
                            "status": "failed",
                            "error_message": "Job is stuck",
                            "attempts": job.attempts + 1
                        })
                        if job.id in jobs_pending_or_in_progress:
                            jobs_pending_or_in_progress.remove(job.id)  # ✅ Use discard() to avoid KeyError
                    
                elif job.status in ["created", "failed"]:
                    if job.attempts >= Config.MAX_JOB_ATTEMPTS:
                        logger.info(f"Job {job.id} has exceeded max attempts, failing job.")
                        await update_job_details(job.id, {
                            "status": "max_attempts_exceeded",
                            "error_message": "Max attempts exceeded",
                            "attempts": job.attempts + 1
                        })                    
                    
                    elif job.id not in jobs_pending_or_in_progress:
                        logger.info(f"Adding job to queue: {job.id}")
                        jobs_pending_or_in_progress.add(job.id)
                        await job_queue.put(job)  # ✅ Async safe queueing
                    
            await asyncio.sleep(3)  # ✅ Correct async sleep
                    
        except Exception as e:
            logger.error(f"Job fetcher failed: {e}")
            await asyncio.sleep(3)
        


async def worker(
        worker_id: int,
        job_queue: asyncio.Queue,
        jobs_pending_or_in_progress: set,
        job_locks = defaultdict(asyncio.Lock) # hint for defaultdict
    ):    
    while True:
        try:
            job = await job_queue.get()
            async with job_locks[job.id]:
                logger.info(f"Worker {worker_id} processing job: {job.id}")
                try:
                    await process_job(job)
                except Exception as e:
                    logger.error(f"Worker {worker_id} failed to process job {job.id}: {e}")
                    await update_job_details(
                        job.id, 
                        {
                            "status": "failed",
                            "error_message": str(e),
                            "attempts": job.attempts + 1
                        }
                    )
                finally:
                    jobs_pending_or_in_progress.remove(job.id)
                    job_locks.pop(job.id, None)
                
            job_queue.task_done()
                    
        except Exception as e:
            logger.error(f"Worker {worker_id} failed: {e}")
            await asyncio.sleep(3)





async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_in_progress = set()
    job_locks = defaultdict(asyncio.Lock)
    job_fetcher_task = asyncio.create_task(job_fetcher(job_queue, jobs_pending_or_in_progress))
    
    workers = [asyncio.create_task(
        worker(
            i + 1,
            job_queue,
            jobs_pending_or_in_progress,
            job_locks)
        ) 
        for i in range(Config.MAX_NUM_WORKERS)]

    await asyncio.gather(job_fetcher_task, *workers)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
