
import asyncio
from asyncio.log import logger
import os
import shutil
import tempfile
from typing import List
import uuid
from asset_processing_service.config import Config
import ffmpeg
import openai
from asset_processing_service.logger import logger
async def split_audio_file(audio_buffer: bytes, max_chunk_size_bytes: int, original_file_name: str):
    file_name_without_ext, file_extension = os.path.splitext(original_file_name)
    chunks = []
    temp_dir = tempfile.mkdtemp()
    try:
        temp_input_path = os.path.join(temp_dir, original_file_name)
        with open(temp_input_path, "wb") as f:
            f.write(audio_buffer)
        if file_extension.lower() == ".mp3":
            logger.info("Input audio is already in MP3 format. Skipping conversion.")
            temp_mp3_path = temp_input_path
        else:
            logger.info("Converting input audio to MP3 format.")
            temp_mp3_path = os.path.join(temp_dir, f"{file_name_without_ext}_converted.mp3")
            await convert_audio_to_mp3(temp_input_path, temp_mp3_path)
            
        probe = await asyncio.to_thread(ffmpeg.probe, temp_mp3_path)
        format_info = probe.get("format", {})
        total_size = int(format_info.get("size", 0))
        duration = float(format_info.get("duration", 0))
        num_chunks = max(1, int((total_size + max_chunk_size_bytes - 1) / max_chunk_size_bytes))
        chunk_duration = duration / num_chunks
        
        logger.info("Total size: ", total_size)
        logger.info("Duration: ", duration)
        logger.info(f"Number of chunks: {num_chunks} of {chunk_duration} seconds each")
        
        output_pattern = os.path.join(temp_dir, f"{file_name_without_ext}_chunk_%03d.mp3")
        split_cmd = ffmpeg.input(temp_mp3_path).output(output_pattern, format="segment", segment_time=chunk_duration, c="copy", reset_timestamps=1)
        await asyncio.to_thread(ffmpeg.run, split_cmd, capture_stdout=True, capture_stderr=True)
        
        chunk_files = sorted(
            [
                f
                for f in os.listdir(temp_dir)
                if f.startswith(f"{file_name_without_ext}_chunk_") and f.endswith(".mp3")
            ]
        )
        
        for chunk_file_name in chunk_files:
            chunk_path = os.path.join(temp_dir, chunk_file_name)
            with open(chunk_path, "rb") as f:
                chunk_data = f.read()
            chunk_size = len(chunk_data)
            
            if (chunk_size <= max_chunk_size_bytes):
                chunks.append(
                    {
                        "data": chunk_data,
                        "size": chunk_size,
                        "file_name": chunk_file_name,
                    }
                )
            else:
                logger.error(f"Chunk {chunk_file_name} exceeds the maximum chunk size after splitting..")
                raise ValueError(f"Chunk {chunk_file_name} exceeds the maximum chunk size after splitting..")
        return chunks
                
        
    except Exception as e:
        logger.error(f"Error splitting audio file: {e}")
        raise e
    finally:
        # Clean up temp files
        shutil.rmtree(temp_dir)
    
    
async def convert_audio_to_mp3(input_path: str, output_path: str):
    """
        Convert audio file to MP3 format using ffmpeg.
    """
    try:
        conversion_cmd = ffmpeg.input(input_path).output(
            output_path,
            format="mp3",
            acodec="libmp3lame",
            q=0,
        )
        await asyncio.to_thread(
            ffmpeg.run,
            conversion_cmd,
            capture_stdout=True,
            capture_stderr=True,
        )
        mp3_file_size = os.path.getsize(output_path)
        logger.info(f"Successfully converted audio to MP3. File size: {mp3_file_size} bytes")
    except Exception as e:
        logger.error(f"Error converting audio to MP3: {e}")
        raise e


async def extract_audio_and_split(video_buffer: bytes, max_chunk_size_bytes: int, original_file_name: str):
    temp_dir = os.path.join(os.getcwd(), "temp", str(uuid.uuid4()))
    os.makedirs(temp_dir, exist_ok=True)
    
    base_file_name = os.path.basename(original_file_name)
    input_file = os.path.join(temp_dir, base_file_name)
    file_name_without_ext = os.path.splitext(base_file_name)[0]
    output_mp3 = os.path.join(temp_dir, f"{file_name_without_ext}.mp3")
    
    try:
        with open(input_file, "wb") as f:
            f.write(video_buffer)
            
        stream = ffmpeg.input(input_file)
        stream = ffmpeg.output(stream, output_mp3, acodec="libmp3lame", q=0, map="a")
        
        await asyncio.to_thread(
            ffmpeg.run,
            stream,
            capture_stdout=True,
            capture_stderr=True,
        )
        with open(output_mp3, "rb") as f:
            mp3_buffer = f.read()
        chunks = await split_audio_file(mp3_buffer, max_chunk_size_bytes, f"{file_name_without_ext}.mp3")
        return chunks
        
    except Exception as e:
        logger.error(f"Error extracting audio and splitting video: {e}")
        raise e
    finally:
        # Clean up temp files
        shutil.rmtree(temp_dir)
        
        
"""
{
    "data": chunk_data,
    "size": chunk_size,
    "file_name": chunk_file_name,
}
"""
        
        
async def transcribe_chunks(chunks: List[dict]) -> List[str]:
    """
        Transcribe audio chunks using OpenAI API.
    """
    async def transcribe_chunk(index: int, chunk: dict) -> dict:
        try:
            logger.info(f"Transcribing chunk {index}: {chunk['file_name']}")
            temp_file_path = os.path.join(os.getcwd(), "temp", chunk["file_name"])
            os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)
            
            with open(temp_file_path, "wb") as f:
                f.write(chunk["data"])
            logger.info(f"Chunk {index} written to temporary file: {temp_file_path}")
            
            with open(temp_file_path, "rb") as audio_file:
                transcription = await openai.Audio.atranscribe(
                    model=Config.OPENAI_MODEL, file=audio_file
                )
                logger.info(f"Transcription for chunk {index}: {transcription.text}")
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return {
                "index": index,
                "content": transcription["text"],
            }              
                    
        except Exception as e:
            logger.error(f"Error transcribing chunk {index}: {e}")
            raise e
    
    logger.info(f"Starting transcription of audio chunks...")
    tasks = [transcribe_chunk(index, chunk) for index, chunk in enumerate(chunks)]
    transcribed_chunks = await asyncio.gather(*tasks)
    logger.info(f"Transcription complete.")
    transcribed_chunks.sort(key=lambda x: x["index"])
    
    transcribed_texts = [chunk["content"] for chunk in transcribed_chunks]
    logger.info(f"Transcribed content extracted from transcribed chunks.")
    return transcribed_texts
