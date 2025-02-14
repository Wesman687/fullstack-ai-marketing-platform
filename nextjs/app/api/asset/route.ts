import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
        return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    try {
        const database = await db();
        const asset = await database.drizzle.select().from(assetTable)
        .where(eq(assetTable.id, assetId)).execute();
        if (asset.length === 0) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }
        database.release();
        return NextResponse.json( asset[0] , { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching asset:", error);
        return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
    }
}
