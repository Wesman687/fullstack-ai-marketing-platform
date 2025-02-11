'use server'
import { db } from "@/server/db"
import { assetTable } from "@/server/db/schema/schema"
import { getAuth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { del } from '@vercel/blob'

export async function GET(request: NextRequest) {
    const { userId } = getAuth(request)
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; // Assuming `/api/projects/[projectId]/asset-processing-jobs`


    try {
        const database = await db(); // ✅ Await db() to get the instance

        const assets = await database
            .select()
            .from(assetTable)
            .where(and(eq(assetTable.projectId, projectId)));
        
        database.$client.destroy();
        return NextResponse.json({ assets }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Assets not found or unauthorized" }, { status: 404 });
    }

}

export async function DELETE(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { 
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const pathnameParts = url.pathname.split("/"); // ✅ Extract parts of URL
    const projectId = pathnameParts[3]; // ✅ Gets `[projectId]` from `/api/projects/[projectId]/assets`
    const assetId = url.searchParams.get("assetId");

    if (!projectId) {
        return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    if (!assetId) {
        return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    try {
        const database = await db(); // ✅ Await db() to get the instance

        const asset = await database
            .select()
            .from(assetTable)
            .where(and(eq(assetTable.projectId, projectId), eq(assetTable.id, assetId!)))
            .limit(1);
        if (asset.length === 0) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }
        await database.delete(assetTable).where(and(eq(assetTable.projectId, projectId), eq(assetTable.id, assetId!)));
        await del(asset[0].fileUrl);

        database.$client.destroy();
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {

        console.log(error)
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    }
}

