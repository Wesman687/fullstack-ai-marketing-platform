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
    const projectId = String(url.pathname.split("/").pop());

    try {
        const database = await db(); // ✅ Await db() to get the instance

        const assets = await database
            .select()
            .from(assetTable)
            .where(and(eq(assetTable.projectId, projectId)));
        return NextResponse.json({ assets }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Assets not found or unauthorized" }, { status: 404 });
    }

}

export async function DELETE(request: NextRequest) {
    const { userId } = getAuth(request)
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const url = new URL(request.url);
    const projectId = String(url.pathname.split("/")[3]);
    const assetId = url.searchParams.get("assetId");

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

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {

        console.log(error)
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    }
}

