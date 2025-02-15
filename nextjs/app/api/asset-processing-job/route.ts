import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateAssetJobSchema = z.object({    
        status: z.enum(["created", "failed", "in_progress", "completed", "max_attempts_exceeded"]).optional(),
        errorMessage: z.string().optional(),
        attempts: z.number().optional(),
        lastHeartBeat: z.string().optional(),    
})

export async function GET(){
    const database = await db();

    try {

        const jobs = await database.drizzle.select().from(assetProcessingJobTable)
        .where(inArray(assetProcessingJobTable.status,[
            //non terminal states
            "created",
            "failed",
            "in_progress",
        ])).execute();
        return NextResponse.json( jobs , { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching jobs:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    } finally {
        database.release();
    }
}

export async function PATCH(request: Request) {
    const database = await db();
    try {
        const body = await request.text(); 

        // ✅ Parse JSON after logging
        const jsonBody = JSON.parse(body);

        // ✅ Validate schema
        const validationResult = updateAssetJobSchema.safeParse(jsonBody);
        if (!validationResult.success) {
            console.error("❌ Validation failed:", validationResult.error.message);
            return NextResponse.json({ error: validationResult.error.message }, { status: 400 });
        }

        const { status, errorMessage, attempts, lastHeartBeat } = validationResult.data;

        // ✅ Get jobId
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get("jobId");
        if (!jobId) {
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }


        // ✅ Perform the update query
        await database.drizzle.update(assetProcessingJobTable)
            .set({
                status,  
                errorMessage: errorMessage ?? sql`NULL`,  // ✅ Use `sql` for NULL values
                attempts: attempts ?? 0,  
                lastHeartBeat: lastHeartBeat ? new Date(lastHeartBeat) : sql`NULL`,  
                updatedAt: new Date(),  // ✅ Ensure updatedAt is refreshed
            })
            .where(eq(assetProcessingJobTable.id, jobId))
            .execute();

        // ✅ Fetch the updated job after updating
        const updatedJob = await database.drizzle
            .select()
            .from(assetProcessingJobTable)
            .where(eq(assetProcessingJobTable.id, jobId))
            .execute();


        return NextResponse.json({ success: true, updatedJob }, { status: 200 });

    } catch (error) {
        console.error("❌ Error updating job:", error);
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    } finally {
        database.release();
    }
}