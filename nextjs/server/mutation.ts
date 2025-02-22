"use server"; // ✅ Server Action (must be at the top)

import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { projectsTable, templatesTable } from "@/server/db/schema/schema";
import { redirect } from "next/navigation";
export async function createProject(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();
    const newId = crypto.randomUUID();

    // ✅ Extract `title` from formData
    const title = formData.get("title") as string | null;

    await database.drizzle.insert(projectsTable).values({
        id: newId,
        title: title || "Untitled Project", // ✅ Default to "Untitled Project" if empty
        userId,
    }); // ✅ Redirect to new project


    redirect(`/project/${newId}`);
}

export async function createTemplate() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();

    const newId = crypto.randomUUID();

    // ✅ Extract `title` from formData

    await database.drizzle.insert(templatesTable).values({
        id: newId,
        title:  "New Template",
        userId,
    });
    database.release();
    return {
        newTemplateId: newId,
    };


}