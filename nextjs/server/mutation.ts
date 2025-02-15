"use server"; // ✅ Server Action (must be at the top)

import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import {  projectsTable, templatesTable } from "@/server/db/schema/schema";
export async function createProject(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();
    try {
        const newId = crypto.randomUUID();

    // ✅ Extract `title` from formData
    const title = formData.get("title") as string | null;

    await database.drizzle.insert(projectsTable).values({
        id: newId,
        title: title || "Untitled Project", // ✅ Default to "Untitled Project" if empty
        userId,
    });
    } catch (error) {
        console.error("❌ Error creating project:", error);
        throw new Error("Failed to create project");
    } finally {
        database.release();
    }
}

export async function createTemplate(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();
    try {
        const newId = crypto.randomUUID();

        // ✅ Extract `title` from formData
        const title = formData.get("title") as string | null;

        await database.drizzle.insert(templatesTable).values({
            id: newId,
            title: title || "Untitled Template",
            userId,
        });
        return {
            newTemplateId: newId,
        };
    } catch (error) {
        console.error("❌ Error creating template:", error);
        throw new Error("Failed to create template");
    } finally {
        database.release();
    }
}