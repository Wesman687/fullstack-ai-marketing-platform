import { dbSecondary } from "@/server/db";
import {  crawlResultsTable } from "@/server/db/schema/db2schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {  eq } from "drizzle-orm"



export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const jobId = pathSegments[4]; 
    const database = await dbSecondary();

    try {
        const crawlResults = await database.drizzle
            .select()
            .from(crawlResultsTable)
            .where(eq(crawlResultsTable.jobId, jobId));
        return NextResponse.json({ crawlResults }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching crawl request:", error);
        return NextResponse.json({ error: "Crawl Request not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   const { id } = params;

//   const database = await dbSecondary();

//   try {
//     await database.drizzle
//       .delete(crawlRequestsTable)
//       .where(eq(crawlRequestsTable.id, id));

//     return NextResponse.json({ message: 'Crawl request deleted' }, { status: 200 });
//   } catch (error) {
//     console.error('❌ Error deleting crawl request:', error);
//     return NextResponse.json({ error: 'Failed to delete crawl request' }, { status: 500 });
//   } finally {
//     database.release();
//   }
// }
