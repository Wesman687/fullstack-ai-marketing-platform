import { dbSecondary } from "@/server/db";
import {  scrapedRequestsTable } from "@/server/db/schema/db2schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";



export async function DELETE(request: NextRequest) {
    const {userId} = getAuth(request);
    console.log("userId", userId);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const id = pathSegments[4]; 

    const database = await dbSecondary();

    try {
        await database.drizzle
      .delete(scrapedRequestsTable)
      .where(eq(scrapedRequestsTable.id, id));

      console.log("Crawl request deleted");

    return NextResponse.json({ message: 'Crawl request deleted' }, { status: 200 });
        
    } catch (error) {
        console.error("❌ Error deleting crawl request:", error);
        return NextResponse.json({ error: "Failed to delete crawl request" }, { status: 500 });
        
    } finally {
        database.release();
    }
}
