import { dbSecondary } from "@/server/db";
import { crawlResultsTable } from "@/server/db/schema/db2schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm"
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

const deleteFieldSchema = z.object({
    job_id: z.string(),
    remove_field: z.string(),
});

export async function DELETE(request: NextRequest) {
    const { userId } = getAuth(request);
    const body = await request.json();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validationResult = deleteFieldSchema.safeParse(body);
    if (!validationResult.success) {
        console.error("❌ Validation failed:", validationResult.error.message);
        return NextResponse.json({ error: validationResult.error.message }, { status: 400 });
    }
    const { job_id, remove_field } = validationResult.data;

    if (!job_id || !remove_field) {
        return NextResponse.json({ error: "Missing job_id or remove_field" }, { status: 400 });
    }

    const database = await dbSecondary();

    try {
        await database.drizzle.transaction(async (trx) => {
            // 1️⃣ Get all rows under the same job_id
            const rows = await trx
                .select({ id: crawlResultsTable.id, data: crawlResultsTable.data })
                .from(crawlResultsTable)
                .where(eq(crawlResultsTable.jobId, job_id));

            if (!rows.length) {
                return NextResponse.json({ message: "No matching rows found." }, { status: 404 });
            }

            // 2️⃣ Prepare batch updates
            const updatePromises = rows.map((row) => {
                // ✅ Check if data is already an object (Fix the JSON issue)
                const parsedData: Record<string, string> =
                    row.data && typeof row.data === "string"
                        ? JSON.parse(row.data)
                        :(row.data as Record<string, string>); // Ensure it's an object

                // 🛠 Delete the specified field
                delete parsedData[remove_field];

                // 🛠 Update the database entry
                return trx
                    .update(crawlResultsTable)
                    .set({ data: parsedData }) // ✅ Store as actual JSON object
                    .where(eq(crawlResultsTable.id, row.id))
                    .execute();
            });

            // 3️⃣ Run all updates in parallel
            await Promise.all(updatePromises);
        });


        return NextResponse.json({
            message: `Field "${remove_field}" removed from all records in job ${job_id}`,
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Error deleting field:", error);
        return NextResponse.json({ error: "Failed to delete field" }, { status: 500 });
    } finally {
        database.release();
    }
}