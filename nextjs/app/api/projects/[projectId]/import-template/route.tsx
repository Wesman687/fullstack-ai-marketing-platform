import { db } from "@/server/db";
import { promptsTable, templatePromptsTable } from "@/server/db/schema/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    api: {
      bodyParser: true, // Enable body parsing for all requests
    },
  };
  


export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }
    if (!req.url) {
        return new Response("Bad Request", { status: 400 });
    }
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3];
    const templateId = url.searchParams.get("templateId");


    if (!templateId) {
        return new Response("Template ID and Project ID are required", { status: 400 })
    }
    const database = await db()
    try {
        const templatePrompts = await database.drizzle.select().from(templatePromptsTable).where(eq(templatePromptsTable.templateId, templateId))
        if (templatePrompts.length === 0) {
            return new Response("Template not found", { status: 404 })
        }
        const startOrder = 0; // Assuming startOrder is defined elsewhere or set to 0
        await database.drizzle.insert(promptsTable).values(templatePrompts.map((tp, index) => ({
            projectId: projectId,
            name: tp.name,
            prompt: tp.prompt,
            order: startOrder + index,
            createdAt: new Date(),
            updatedAt: new Date(),
        })))
        const results = await database.drizzle.select().from(promptsTable).where(eq(promptsTable.projectId, projectId)).orderBy(promptsTable.order)
         return NextResponse.json(results, { status: 200 })

    } catch (error) {
        console.error(error)
        return new Response("Failed to import template", { status: 500 })

    } finally {
        database.release()
    }

}