'use server'
import { db } from "@/server/db"
import { assetTable } from "@/server/db/schema/schema"
import { getAuth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { del } from '@vercel/blob'

export async function GET(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; 

    const database = await db();

    try {

        const assets = await database.drizzle
            .select()
            .from(assetTable)
            .where(eq(assetTable.projectId, projectId));

        return NextResponse.json({ assets }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching assets:", error);
        return NextResponse.json({ error: "Assets not found or unauthorized" }, { status: 404 });
    } finally {
        database.release();
    }
}

export async function DELETE(request: NextRequest) {
    const { userId } = getAuth(request);
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const url = new URL(request.url);
    const assetId = url.searchParams.get("assetId");
    const pathSegments = url.pathname.split("/");
    const projectId = pathSegments[3]; 


    if (!assetId) {
        return NextResponse.json({ error: "Missing assetId" }, { status: 400 });
    }
    const database = await db();

    try {

        const asset = await database.drizzle
            .select()
            .from(assetTable)
            .where(and(eq(assetTable.projectId, projectId), eq(assetTable.id, assetId)))
            .limit(1);
        

        if (asset.length === 0) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        // ✅ Delete asset from database
        await database.drizzle.delete(assetTable).where(and(eq(assetTable.projectId, projectId), eq(assetTable.id, assetId)));

        // ✅ Delete from Vercel Blob Storage
        await del(asset[0].fileUrl);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("❌ Error deleting asset:", error);
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    } finally {
        database.release();
    }
}
