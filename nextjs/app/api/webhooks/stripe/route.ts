import { webhookSecret } from "@/lib/config"
import stripe from "@/lib/stripe"
import { db } from "@/server/db"
import { subscriptionsTable } from "@/server/db/schema/schema"
import { NextResponse } from "next/server"
import Stripe from "stripe"


export async function POST(req: Request) {


    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature') as string


    console.log(`Received webhook`)

    let event: Stripe.Event


    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)
    } catch (error) {
        console.error("Error verifying webhook signature", error)
        return new Response("Webhook signature verification failed", { status: 400 })
    }

    console.log(`Processing ${event.type} event`)

    try {
        switch (event.type) {
            case "customer.subscription.created":
                const subscription = event.data.object as Stripe.Subscription
                await handleNewSubscription(subscription)
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`)
        }
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Error processing webhook event", error)
        return new Response("Error processing webhook event", { status: 500 })

    }
}

async function handleNewSubscription(subscription: Stripe.Subscription) {

    console.log(`Processing new subscription: ${subscription.id}`)

    try {
        const customer = await stripe.customers.retrieve(
            subscription.customer as string
        )
        console.log(`Retrieved customer: ${customer.id}`)

        if (customer.deleted) {
            throw new Error(`Customer ${customer.id} is deleted`)
        }
        const userid = customer.metadata.userId
        console.log(`Customer ${customer.id} is associated with user ${userid}`)

        if (!userid) {
            throw new Error(`Customer ${customer.id} is not associated with a user`)
        }

        const subscriptionData = {
            userId: userid,
            stripeSubscriptionId: subscription.id,
        };

        const database = await db()
        await database.drizzle.insert(subscriptionsTable).values(subscriptionData)
        database.release()

    } catch (error) {
        console.error("Error retrieving customer", error)
        throw error
    }
}