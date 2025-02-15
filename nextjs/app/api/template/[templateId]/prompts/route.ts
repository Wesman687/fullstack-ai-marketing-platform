import { db } from "@/server/db";
import { templatePromptsTable } from "@/server/db/schema/schema";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getPromptTokenCount } from "@/lib/token-helper";

const createPromptSchema = z.object({
    name: z.string().min(1, "Name is required"),
    prompt: z.string().optional(),
    order: z.number().int().nonnegative(),
});

const updatePromptSchema = createPromptSchema.extend({
    id: z.string().min(1, "ID is required"),
});

export async function GET(request: NextRequest){
    
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const templateId = pathnameParts[3];
    
    if (!templateId) {
        return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }
    
    const database = await db();
    try {
        const prompts = await database.drizzle.query.templatePromptsTable.findMany({
            where: eq(templatePromptsTable.templateId, templateId),
            orderBy: templatePromptsTable.order
        })
        return NextResponse.json(prompts, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching prompts:", error);
        return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
    } finally {
        await database.release();
    }
}

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const templateId = pathnameParts[3];

    if (!templateId) {
        return NextResponse.json({error: "Template ID is required"}, {status: 400});
    }

    const database = await db();
    const json = await request.json();
    const validatedFields = createPromptSchema.safeParse(json);
    if (!validatedFields.success) {
        return NextResponse.json({error: "Invalid fields"}, {status: 400});
    }

    const {name, prompt, order} = validatedFields.data;
    const tokenCount = getPromptTokenCount(prompt || "")

    try {
        const newId = crypto.randomUUID();

        await database.drizzle.insert(templatePromptsTable).values({
            id: newId,
            name,
            prompt: prompt || "",
            order,
            tokenCount,
            templateId,
        });
        const [result] = await database.drizzle.select().from(templatePromptsTable).where(eq(templatePromptsTable.id, newId));
        return NextResponse.json(result, {status: 200});

    } catch (error) {
        console.error("Error creating prompt:", error);
        return NextResponse.json({error: "Failed to create prompt"}, {status: 500});

    } finally {
        await database.release();
    }
}

export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const templateId = pathnameParts[3];
    const id = url.searchParams.get("id");

    if (!templateId || !id) {
        return NextResponse.json({error: "Template ID and ID are required"}, {status: 400});
    }

    const database = await db();

    try {
        await database.drizzle.delete(templatePromptsTable).where(and(eq(templatePromptsTable.id, id), eq(templatePromptsTable.templateId, templateId)));
        return NextResponse.json({message: "Prompt deleted successfully"}, {status: 200});
    } catch (error) {
        console.error("Error deleting prompt:", error);
        return NextResponse.json({error: "Failed to delete prompt"}, {status: 500});
    } finally {
        await database.release();
    }
}


export async function PATCH(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const templateId = pathnameParts[3];

    if (!templateId) {
        return NextResponse.json({error: "Template ID is required"}, {status: 400});
    }
    const database = await db();
    const json = await request.json();
    const validatedFields = updatePromptSchema.safeParse(json);
    if (!validatedFields.success) {
        return NextResponse.json({error: "Invalid fields"}, {status: 400});
    }
    const {name, prompt, order, id} = validatedFields.data;
    const tokenCount = getPromptTokenCount(prompt || "")

    try {
        await database.drizzle.update(templatePromptsTable).set({
            name,
            prompt,
            order,
            tokenCount,
        }).where(and(eq(templatePromptsTable.id, id), eq(templatePromptsTable.templateId, templateId)));
        const [result] = await database.drizzle.select().from(templatePromptsTable).where(eq(templatePromptsTable.id, id));
        return NextResponse.json(result, {status: 200});

    } catch (error) {
        console.error("Error updating prompt:", error);
        return NextResponse.json({error: "Failed to update prompt"}, {status: 500});    

    } finally {
        await database.release();
    }
}