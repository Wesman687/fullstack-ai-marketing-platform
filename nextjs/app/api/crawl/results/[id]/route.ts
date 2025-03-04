import { dbSecondary } from "@/server/db";
import {  crawlResultsTable } from "@/server/db/schema/db2schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {  eq } from "drizzle-orm"
import { z } from "zod";

const updateCrawlResultSchema = z.object({
    data: z.record(z.string(), (z.any())), // Accepts any JSON object
});



export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const jobId = pathSegments[4]; 
    const database = await dbSecondary();

    try {
        const results = await database.drizzle
            .select()
            .from(crawlResultsTable)
            .where(eq(crawlResultsTable.jobId, jobId));
        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching crawl request:", error);
        return NextResponse.json({ error: "Crawl Request not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}
export async function DELETE(request: NextRequest) {
    const { userId } = getAuth(request);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[4];

    if (!id) {
        return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const database = await dbSecondary();

    try {
        // Delete the row with the matching ID
        await database.drizzle
            .delete(crawlResultsTable)
            .where(eq(crawlResultsTable.id, id))
            .execute();

        return NextResponse.json({ message: "Row deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error deleting row:", error);
        return NextResponse.json({ error: "Failed to delete row" }, { status: 500 });
    } finally {
        database.release();
    }
}


export async function PATCH(request: NextRequest) {
    const { userId } = getAuth(request);
    const body = await request.json(); // Use `json()` instead of `text()`

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[4];

    const validationResult = updateCrawlResultSchema.safeParse(body);
    if (!validationResult.success) {
        console.error("❌ Validation failed:", validationResult.error.message);
        return NextResponse.json({ error: validationResult.error.message }, { status: 400 });
    }

    const { data } = validationResult.data;

    const database = await dbSecondary();

    try {
        await database.drizzle
            .update(crawlResultsTable)
            .set({ data }) // Store as JSON object
            .where(eq(crawlResultsTable.id, id))
            .execute();

        return NextResponse.json({ message: "Crawl request updated" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating crawl request:", error);
        return NextResponse.json({ error: "Failed to update crawl request" }, { status: 500 });
    } finally {
        database.release();
    }
}
