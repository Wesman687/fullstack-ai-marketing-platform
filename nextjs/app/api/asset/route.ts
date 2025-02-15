import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateAssetSchema = z.object({
    content: z.string(),
    tokenCount: z.number(),
})


export async function GET(request: Request){
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
        return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const database = await db();
    try {
        const asset = await database.drizzle.select().from(assetTable)
        .where(eq(assetTable.id, assetId)).execute();
        if (asset.length === 0) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }
        return NextResponse.json( asset[0] , { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching asset:", error);
        return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
    } finally {
        database.release();
    }
}

export async function PATCH(request: Request){
    console.log("Updating asset content...")
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get("assetId");    
    
    if (!assetId) {
        return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }
    const body = await request.json();
    const updateAsset = updateAssetSchema.safeParse(body);

    if (!updateAsset.success) {
        return NextResponse.json({ error: "Invalid request body", details: updateAsset.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { content, tokenCount } = updateAsset.data;
    const database = await db();
    
    try {
        const asset = await database.drizzle.select().from(assetTable)
        .where(eq(assetTable.id, assetId)).execute();
        
        if (asset.length === 0) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }       
        await database.drizzle.update(assetTable)
        .set({ content, tokenCount })
        .where(eq(assetTable.id, assetId)).execute();
        
        console.log("✅ Asset content updated successfully");
        return NextResponse.json({ message: "Asset content updated successfully" }, { status: 200 });
        
    } catch (error) {
        console.error("❌ Error updating asset content:", error);
        return NextResponse.json({ error: "Failed to update asset content" }, { status: 500 });
    } finally {
        database.release();
    }
    
    
}