import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema/schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { 
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); 
    }

    // ✅ Extract `projectId` directly from the URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; // Assuming `/api/projects/[projectId]/asset-processing-jobs`

    if (!projectId) {
        return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }


    try {
        const database = await db(); // ✅ Await db() to get the instance

        const assets = await database.drizzle
            .select()
            .from(assetProcessingJobTable)
            .where(eq(assetProcessingJobTable.projectId, projectId));
        
        database.release();
        return NextResponse.json(assets , { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching assets:", error);
        return NextResponse.json({ error: "Assets not found or unauthorized" }, { status: 404 });
    }
}
