'use server'
import { db } from "@/server/db"
import { assetProcessingJobTable, projectsTable } from "@/server/db/schema/schema"
import { getAuth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateProjectSchema = z.object({
    title: z.string().min(1).max(255),
})


export async function PATCH(request: NextRequest) {
    const { userId } = getAuth(request)
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const url = new URL(request.url);
    const projectId = String(url.pathname.split("/").pop());// ✅ Get last segment of URL

    const body = await request.json()
    const validateData = updateProjectSchema.safeParse(body)

    if (!validateData.success) {
        return NextResponse.json({ error: validateData.error.errors }, { status: 400 })
    }

    const { title } = validateData.data
    const database = await db();
    try {
        // ✅ Await db() to get the instance

        const [result] = await database.drizzle
            .update(projectsTable)
            .set({ title })
            .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)));

        // ✅ Check if any rows were affected (for MySQL)
        if (!result || result.affectedRows === 0) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }


        // ✅ Fetch the updated project manually
        const [updatedProject] = await database.drizzle
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.id, projectId));
        return NextResponse.json({ message: "Project updated successfully", project: updatedProject }, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating project:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    } finally {

        database.release();
    }
}

export async function DELETE(request: NextRequest) {

    const { userId } = getAuth(request)
    if (!userId) { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    const url = new URL(request.url);
    const projectId = String(url.pathname.split("/").pop());

    const database = await db(); // ✅ Await db() to get the instance

    try {
        const [result] = await database.drizzle
            .delete(projectsTable)
            .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)));

        const [result2] = await database.drizzle
            .delete(assetProcessingJobTable)
            .where(eq(assetProcessingJobTable.projectId, projectId));
        // ✅ Check if any rows were affected (for MySQL)
        if (!result || !result2 || result.affectedRows === 0) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    } finally {
        database.release();
    }
}


