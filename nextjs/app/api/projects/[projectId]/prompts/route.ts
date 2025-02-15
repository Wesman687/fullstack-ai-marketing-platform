import { db } from "@/server/db";
import { promptsTable } from "@/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const newPromptSchema = z.object({
    name: z.string().default("New Prompt"),
    prompt: z.string().default(""),
    order: z.number().default(0),
    tokenCount: z.number().default(0),
});

const updatePromptSchema = newPromptSchema.extend({
    id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3];

    const json = await request.json();
    const validatedFields = newPromptSchema.safeParse(json);
    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }
    const { name, prompt, order, tokenCount } = validatedFields.data;
    const database = await db();

    try {
        const newId = crypto.randomUUID();

        await database.drizzle.insert(promptsTable).values({
            id: newId,
            name,
            prompt,
            order,
            tokenCount,
            projectId,
        });
        const [result] = await database.drizzle.select().from(promptsTable).where(eq(promptsTable.id, newId));

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error("❌ Error creating prompt:", error);
        return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
    } finally {
        database.release();
    }

}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3];

    if (!projectId) {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    const database = await db();

    try {
        const prompts = await database.drizzle
            .select()
            .from(promptsTable)
            .where(eq(promptsTable.projectId, projectId));

        // Check if prompts is an array and has at least one element:
        if (Array.isArray(prompts) && prompts.length > 0) {
            // Drizzle might return metadata along with the results.
            // If so, take only the data objects (prompts):
            const promptData = prompts.filter(item => typeof item === 'object' && item !== null && !Array.isArray(item)); // Filter out metadata
            return NextResponse.json(promptData);
        } else {
            // Handle the case where no prompts are found:
            return NextResponse.json([], { status: 200 }); // Or a 404 if you prefer
        }


    } catch (error) {

        console.error("❌ Error fetching prompts:", error);
        return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });

    } finally {
        database.release();
    }

}

export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3];
    const promptId = url.searchParams.get("promptId");

    if (!projectId || !promptId) {
        return NextResponse.json({ error: "Project ID and Prompt ID are required" }, { status: 400 });
    }
    const database = await db();

    try {
        
        await database.drizzle.delete(promptsTable).where(eq(promptsTable.id, promptId));
        return NextResponse.json({ message: "Prompt deleted successfully" }, { status: 200 });

    } catch (error) {

        console.error("❌ Error deleting prompt:", error);
        return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });

    } finally {
        database.release();
    }
}

export async function PATCH(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3];

    if (!projectId) {
        return NextResponse.json({ error: "Project ID and Prompt ID are required" }, { status: 400 });
    }
    
    const json = await request.json();
    const validatedFields = updatePromptSchema.safeParse(json);
    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { id, name, prompt, order, tokenCount } = validatedFields.data;
    const database = await db();

    try {
        await database.drizzle.update(promptsTable).set({ name, prompt, order, tokenCount }).where(eq(promptsTable.id, id));
        
        const [result] = await database.drizzle.select().from(promptsTable).where(eq(promptsTable.id, id));
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating prompt:", error);
        return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
    } finally {
        database.release();
    }
}