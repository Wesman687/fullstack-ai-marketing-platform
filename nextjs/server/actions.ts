"use server";

import { getProjectsForUser } from "@/server/db/queries";
import { getProject as fetchProjectFromDB } from "@/server/db/queries";

export async function fetchProjects() {
    return await getProjectsForUser();
}

export async function getProject(projectId: string) {
  return await fetchProjectFromDB(projectId); // ✅ Safe server-side call
}