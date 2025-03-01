import { dbSecondary } from "@/server/db";
import { crawlRequestsTable } from "@/server/db/schema/db2schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm"



export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const database = await dbSecondary();

    try {
        const crawlRequests = await database.drizzle
      .select()
      .from(crawlRequestsTable)
      .where(eq(crawlRequestsTable.userId, userId))
      .orderBy(desc(crawlRequestsTable.updatedAt), desc(crawlRequestsTable.createdAt));


    return NextResponse.json({ crawlRequests }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching crawl request:", error);
        return NextResponse.json({ error: "Crawl Request not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}

