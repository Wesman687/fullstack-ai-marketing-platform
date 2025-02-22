import stripe from "@/lib/stripe";
import { db } from "@/server/db";
import { stripeCustomersTable } from "@/server/db/schema/schema";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const database = await db()
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const baseUrl = process.env.APP_URL;
        if (!baseUrl) {
            throw new Error("APP_URL environment variable is not set");
        }

        const customer = await database.drizzle.query.stripeCustomersTable.findFirst({
            where: eq(stripeCustomersTable.userId, userId),
        })

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.stripeCustomerId,
            return_url: `${baseUrl}/settings`,
        });
        return NextResponse.json({ url: session.url }, { status: 200 });

    } catch (error) {
        console.error("Error creating checkout session", error);
        return NextResponse.json(
            { error: "Error creating checkout session" },
            { status: 500 }
        );

    } finally {
        database.release()
    }
}