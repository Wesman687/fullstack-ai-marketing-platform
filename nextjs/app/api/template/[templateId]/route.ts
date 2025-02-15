import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db/";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { templatesTable } from "@/server/db/schema/schema";

const updateTemplateSchema = z.object({
    title: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const templateId = pathnameParts[3];

    if (!templateId) {
        return NextResponse.json({error: "Template ID is required"}, {status: 400});
    }
    const json = await request.json();
    const validatedFields = updateTemplateSchema.safeParse(json);

    if (!validatedFields.success) {
        return NextResponse.json({error: "Invalid fields"}, {status: 400});
    }

    const {title} = validatedFields.data;

    const database = await db();
   
    try {

        await database.drizzle.update(templatesTable).set({title}).where(eq(templatesTable.id, templateId));

        const [result] = await database.drizzle.select().from(templatesTable).where(eq(templatesTable.id, templateId));

        return NextResponse.json(result, {status: 200});
        
    } catch (error) {
        console.error("Error updating template", error);
        return NextResponse.json({error: "Error updating template"}, {status: 500});
    } finally {
        database.release();
    }    
    
}

export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/");
    const templateId = pathnameParts[3];
    
    if (!templateId) {
        return NextResponse.json({error: "Template ID is required"}, {status: 400});
    }

    const database = await db();

    try {   
        await database.drizzle.delete(templatesTable).where(eq(templatesTable.id, templateId));
        return NextResponse.json({message: "Template deleted successfully"}, {status: 200});
    } catch (error) {
        console.error("Error deleting template", error);
        return NextResponse.json({error: "Error deleting template"}, {status: 500});
    } finally {
        database.release();
    }
}
