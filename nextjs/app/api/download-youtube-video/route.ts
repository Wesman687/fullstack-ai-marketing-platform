import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import { upload } from '@vercel/blob/client';
import ffmpeg from 'fluent-ffmpeg';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

    // Save the uploaded file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = path.join('/tmp', `${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const outputFilePath = path.join('/tmp', `${Date.now()}-processed.mp4`);

    // Run FFmpeg processing
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions('-vf', 'scale=1280:720') // Example: Resize to 720p
        .output(outputFilePath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Upload the processed video to blob storage
    const processedBuffer = await readFile(outputFilePath);
    const uploadedFile = await upload(`processed-${file.name}`, new Blob([processedBuffer]), {
      access: 'public',
      handleUploadUrl: '/api/upload',
      multipart: true,
      clientPayload: JSON.stringify({
        projectId,
        title: `Processed-${file.name}`,
        file: 'video',
        mimeType: 'video/mp4',
        size: processedBuffer.length,
      }),
    });

    // Cleanup temporary files
    await unlink(tempFilePath);
    await unlink(outputFilePath);

    return NextResponse.json(
      { url: uploadedFile.url, message: 'Video processed and uploaded successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Video Processing Error:', error);
    return NextResponse.json({ error: 'Failed to process the video.' }, { status: 500 });
  }
}

