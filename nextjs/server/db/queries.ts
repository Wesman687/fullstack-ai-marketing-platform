import { auth } from "@clerk/nextjs/server";
import { and, eq, desc } from "drizzle-orm";
import { projectsTable, subscriptionsTable, templatesTable } from "./schema/schema";
import { db } from ".";
import stripe from "@/lib/stripe";

export async function getProjectsForUser() {
    const database = await db(); // ✅ Await the database connection
    
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not found");
        }
        // ✅ Run query
        const projects = await database.drizzle.query.projectsTable.findMany({
            where:(eq(projectsTable.userId, userId)),
            orderBy:(desc(projectsTable.updatedAt))
        })
        database.release();
        return projects;
    
    
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
export interface SimplifiedSubscription {
    id: string;
    status: string;
    cancel_at?: number | null;
    current_period_end: number;
  }
  

export async function getUserSubscription(): Promise<SimplifiedSubscription | null> {

    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    const database = await db();

    try {

        const subscription = await database.drizzle.query.subscriptionsTable.findFirst({
            where: eq(subscriptionsTable.userId, userId),
        })
        if (!subscription) {
            console.log("❌ Subscription not found for user:", userId);
            return null;
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
        const simplifiedSubscription: SimplifiedSubscription = {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            cancel_at: stripeSubscription.cancel_at,
            current_period_end: stripeSubscription.current_period_end,
          };

        return simplifiedSubscription
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("Stripe subscription not found")
        ) {
            console.log("❌ Stripe subscription not found for user:", userId);
            return null;
        }
        console.error("❌ Error in getUserSubscription:", error);
        throw new Error("error");
    } finally {
        database.release()
    }
}