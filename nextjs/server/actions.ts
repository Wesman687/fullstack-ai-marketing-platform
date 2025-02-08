"use server";

import { getProjectsForUser } from "@/server/db/queries";

export async function fetchProjects() {
    return await getProjectsForUser();
}