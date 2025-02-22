import { db } from "@/server/db";
import { generatedContentTable, projectsTable } from "@/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai"
import { uuidv4 } from "@/lib/utils";
import { z } from "zod";

export const maxDuration = 60; // seconds

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; // Assuming `/api/projects/[projectId]/asset-processing-jobs`

    if (!projectId) {
        return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }
    const database = await db()
    try {
        const generatedContent = await database.drizzle.select().from(generatedContentTable).where(eq(generatedContentTable.projectId, projectId)).orderBy(generatedContentTable.order)
        console.log(generatedContent)
        return NextResponse.json(generatedContent);
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Generated content not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}

  function estimateTokens(text: string): number {
    const words = text.trim().split(/\s+/); // Split text by whitespace
    return Math.ceil(words.length * 0.75);  // Rough estimate of tokens
  }
  
  
  
  const MAX_TOKENS = 8000; // Safe buffer for GPT-4o (context window is ~10k)

  function splitTextIntoChunks(text: string): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentences
    const chunks: string[] = [];
    let currentChunk = '';
  
    for (const sentence of sentences) {
      const potentialChunk = `${currentChunk} ${sentence}`;
      const estimatedTokens = estimateTokens(potentialChunk);
  
      if (estimatedTokens > MAX_TOKENS) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence; // Start a new chunk
      } else {
        currentChunk = potentialChunk;
      }
    }
  
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
  
    console.log("Generated Chunks:", chunks);
    return chunks;
  }

export async function POST(request: NextRequest) {
  console.log("Endpoint hit");
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const projectId = pathSegments[3]; // Assuming `/api/projects/[projectId]/asset-processing-jobs`

  if (!projectId) {
    return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
  }

  const database = await db();

  try {
    const project = await database.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.id, projectId),
      with: {
        assets: true,
        prompts: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      );
    }

    const { assets, prompts } = project;
    console.log('Generating content for project: ', projectId);
    const contentFromAssets = assets.map((asset) => asset.content).join('\n');

    const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4o-turbo'];

    const generatedContentPromises = prompts.map(async (prompt) => {
      let text = '';
      let success = false;

      const inputPrompt = `
        Please use the following prompt and summary to generate new content:
        ** PROMPT:
        ${prompt.prompt}
        ----------------
        ** SUMMARY:
        ${contentFromAssets}
      `;

      // Count tokens before making a request
      const inputChunks = await splitTextIntoChunks(inputPrompt);

      // If too many tokens, split the input
      for (const model of models) {
        try {
          for (const chunk of inputChunks) {
            const response = await generateText({
              model: openai(model),
              system: 'You are a content generation assistant.',
              prompt: chunk,
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
            });

            text += response.text + '\n'; // Merge results from all chunks
          }

          success = true;
          console.log('Generated Content using model: ', model);
          break;
        } catch (error: unknown) {
          const err = error as Error & { statusCode?: number };
          console.error(`Failed to generate content using model: ${model}`, err);

          if (
            err.statusCode === 503 ||
            err.statusCode === 429 ||
            err.message.includes('overloaded')
          ) {
            continue;
          } else {
            throw error;
          }
        }
      }

      if (!success) {
        throw new Error('Failed to generate content');
      }

      const uuid = uuidv4();
      await database.drizzle.insert(generatedContentTable).values({
        id: uuid,
        projectId,
        name: prompt.name,
        result: text,
        order: prompt.order,
      });

      const [insertedContent] = await database.drizzle
        .select()
        .from(generatedContentTable)
        .where(eq(generatedContentTable.id, uuid));

      return insertedContent;
    });

    const insertedContentList = await Promise.all(generatedContentPromises);

    return NextResponse.json(insertedContentList, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to Generate Content' },
      { status: 500 }
    );
  } finally {
    database.release();
  }
}
export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; // Assuming `/api/projects/[projectId]/asset-processing-jobs`

    if (!projectId) {
        return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }
    const database = await db()
    try {
        await database.drizzle.transaction(async (trx) => {
            await trx.delete(generatedContentTable)
                .where(eq(generatedContentTable.projectId, projectId))
        })
        return NextResponse.json({ message: "Generated content deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete generated content" }, { status: 500 });
        console.error(error)
    } finally {
        database.release();
    }
}

const updateGeneratedContentSchema = z.object({
    id: z.string(),
    result: z.string().min(1, "Result is required"),
});

export async function PATCH(request: NextRequest) {

    const database = await db()
    try {
        const body = await request.json();
        const parseResults = updateGeneratedContentSchema.safeParse(body);
        if (!parseResults.success) {
            return NextResponse.json({ error: parseResults.error.errors }, { status: 400 });
        }
        const { id, result } = parseResults.data;
        const [updatedResult] = await database.drizzle
             .update(generatedContentTable)            
            .set({ result })
            .where(eq(generatedContentTable.id, id))

        if (!updatedResult || updatedResult.affectedRows === 0) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const [updatedContent] = await database.drizzle.select()
            .from(generatedContentTable)
            .where(eq(generatedContentTable.id, id));

        if (!updatedContent) {
            return NextResponse.json({ error: "Generated content not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(updatedContent, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update generated content" }, { status: 500 });
        console.error(error)
    } finally {
        database.release();
    }
}