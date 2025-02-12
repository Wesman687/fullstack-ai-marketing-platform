import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema/schema";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateAssetJobSchema = z.object({
    status: z.enum(["created", "failed", "in_progress", "completed", "max_attempts_created"]),
})

export async function GET(){

    try {
        const database = await db();
        const jobs = await database.select().from(assetProcessingJobTable)
        .where(inArray(assetProcessingJobTable.status,[
            //non terminal states
            "created",
            "failed",
            "in_progress",
        ])).execute();
        database.$client.destroy();
        return NextResponse.json( jobs , { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}

export async function PATCH(request: Request){
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
        return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { status, lastHeartBeat } = body;

    try {
        const database = await db();
        const jobs = await database.select().from(assetProcessingJobTable)
        .where(inArray(assetProcessingJobTable.status,[
            //non terminal states
            "created",
            "failed",
            "in_progress",
        ])).execute();
        database.$client.destroy();
        return NextResponse.json( jobs , { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}