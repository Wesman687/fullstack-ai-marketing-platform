import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";
import { projectsTable } from "./schema/schema";
import { db } from ".";

export async function getProjectsForUser() {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not found");
        }

        console.log("✅ User authenticated:", userId);

        const database = await db(); // ✅ Await the database connection
        console.log("✅ Database connected successfully");
        // ✅ Run query
        const projects = await database
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.userId, userId))
            .orderBy(desc(projectsTable.updatedAt));


        return projects;
    } catch (error) {
        console.error("❌ Error in getProjectsForUser:", error);
        throw new Error("error");
    }
}

export async function getProject(projectid: string) {

    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db(); // ✅ Await the database connection
        console.log("✅ Database connected successfully");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // ✅ Run query
        const projects = await database
            .select()
            .from(projectsTable)
            .where(
                and(
                  eq(projectsTable.userId, userId),
                  eq(projectsTable.id, projectid)
                )
              )
            .orderBy(desc(projectsTable.updatedAt));


        return projects[0] || null;
}