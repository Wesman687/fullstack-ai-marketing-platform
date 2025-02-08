"use server"; // ✅ Server Action (must be at the top)

import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import {  projectsTable } from "@/server/db/schema";

export async function createProject(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();
    const newId = crypto.randomUUID();

    // ✅ Extract `title` from formData
    const title = formData.get("title") as string | null;

    await database.insert(projectsTable).values({
        id: newId,
        title: title || "Untitled Project", // ✅ Default to "Untitled Project" if empty
        userId,
    });

}
