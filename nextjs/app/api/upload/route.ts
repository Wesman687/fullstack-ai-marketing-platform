import { db } from '@/server/db';
import { assetProcessingJobTable, assetTable } from '@/server/db/schema/schema';
import { auth } from '@clerk/nextjs/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async ( pathname, clientPayload) => {        
        const { userId } = await auth()
        if (!userId) {
          return {};
        }

        return {
          allowedContentTypes: [
            'video/mp4',
            'video/quicktime',
            'audio/mpeg',
            'audio/ogg',
            'audio/wav',
            'text/plain',
            'text/markdown',
          ],
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024, // 5MB
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow
        if (!tokenPayload) return;
        const { projectId, file: fileType, mimeType, size } = JSON.parse(tokenPayload);
 
        try {
            const database = await db();
            const [newAsset] = await database.insert(assetTable).values({
            projectId,
            title: blob.pathname.split('/').pop() || blob.pathname,
            fileName: blob.pathname,
            fileUrl: blob.url,
            fileType,
            mimeType,
            size,
          }).execute();

          const insertedId = newAsset.insertId.toString();
          await database.insert(assetProcessingJobTable).values({
            assetId: insertedId,
            projectId,
            status: 'pending',
          }).execute();
          
        } catch (error) {
          throw new Error('Could not save asset or asset processing job to database');
          console.log(error)
        }
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}