import { dbSecondary } from "@/server/db";
import { scrapedRequestsTable } from "@/server/db/schema/db2schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {  desc, eq } from "drizzle-orm"



export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const database = await dbSecondary();

    try {
        const results = await database.drizzle
      .select()
      .from(scrapedRequestsTable)
      .where(eq(scrapedRequestsTable.userId, userId)) // Filter by user ID
       .orderBy(desc(scrapedRequestsTable.updatedAt), desc(scrapedRequestsTable.createdAt));

    return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching crawl request:", error);
        return NextResponse.json({ error: "Crawl Request not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}
