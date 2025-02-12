import asyncio
from time import sleep
from asset_processing_service.api_client import fetch_jobs
from asset_processing_service.config import Config



async def job_fetcher(
        job_queue: asyncio.Queue,
        jobs_pending_or_in_progress: set):

    while True:
        print("Fetching job...", flush=True)
        jobs = await fetch_jobs()        
        for job in jobs: # ✅ Proper async queueing            
            current_time = asyncio.get_running_loop().time() # ✅ Correctly get the current timestamp            
            if job.status == "in_progress":
                last_heartbeat = job.last_heartbeat.timestamp()             
                time_since_last_heartbeat = current_time - last_heartbeat                
                if time_since_last_heartbeat > Config.STUCK_JOB_THRESHOLD_SECONDS:
                    print(f"Job {job.id} is stuck, Failing job.")
                    # TODO: update job details - status = failed - attempts +=1 
                    jobs_pending_or_in_progress.discard(job.id)  # ✅ Use discard() to avoid KeyError
                    
            elif job.status in ["created", "failed"]:
                if job.attempts >= Config.MAX_JOB_ATTEMPTS:
                    print(f"Job {job.id} has exceeded max attempts, failing job.")
                    # TODO: update job details - status = max_attempts_exceeded - error message = "Max attempts exceeded"
                    
                elif job.id not in jobs_pending_or_in_progress:
                    print(f"Adding job to queue: {job.id}")
                    jobs_pending_or_in_progress.add(job.id)
                    await job_queue.put(job)  # ✅ Async safe queueing
        
        sleep(5)  # ✅ Correct async sleep


async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_in_progress = set()
    job_fetcher_task = asyncio.create_task(
        job_fetcher(job_queue, jobs_pending_or_in_progress))

    await asyncio.gather(job_fetcher_task)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
