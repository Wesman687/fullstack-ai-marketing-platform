import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";
import { projectsTable, templatesTable } from "./schema/schema";
import { db } from ".";

export async function getProjectsForUser() {
    const database = await db(); // ✅ Await the database connection
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not found");
        }

        console.log("✅ User authenticated:", userId);

        console.log("✅ Database connected successfully");
        // ✅ Run query
        const projects = await database.drizzle
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.userId, userId))
            .orderBy(desc(projectsTable.updatedAt));

        return projects;
    } catch (error) {
        console.error("❌ Error in getProjectsForUser:", error);
        throw new Error("error");
    } finally {
        database.release();
    }
}

export async function getProject(projectid: string) {

    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db(); // ✅ Await the database connection
    try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
    // ✅ Run query
    const projects = await database.drizzle
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
    } catch (error) {
        console.error("❌ Error in getProject:", error);
        throw new Error("error");
    } finally {
        database.release(); 
    }
}

export async function getTemplatesForUser() {
    const database = await db();
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not found");
        }

        const templates = await database.drizzle
            .select()
            .from(templatesTable)
            .where(eq(templatesTable.userId, userId))
            .orderBy(desc(templatesTable.updatedAt));

        return templates;
    } catch (error) {
        console.error("❌ Error in getTemplatesForUser:", error);
        throw new Error("error");
    } finally {
        database.release();
    }
}

export async function getTemplate(templateId: string) {
    const database = await db();
    try {
        const template = await database.drizzle.select().from(templatesTable).where(eq(templatesTable.id, templateId));
        return template[0] || null;
    } catch (error) {
        console.error("❌ Error in getTemplate:", error);
        throw new Error("error");
    } finally {
        database.release();
    }
}