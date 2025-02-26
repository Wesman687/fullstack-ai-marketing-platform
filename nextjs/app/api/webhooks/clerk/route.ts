import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { dbSecondary } from '@/server/db'
import { usersTable } from '@/server/db/schema/db2schema'
import { NextResponse } from 'next/server'
import { FREE_CREDIT, FREE_STORAGE } from '@/lib/constants'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data
  const eventType = evt.type
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log('Webhook payload:', body)
  if (eventType === 'user.created') {
    const database = await dbSecondary()
    try {
      const id = crypto.randomUUID();
      const result = await database.drizzle.insert(usersTable).values({
        id: id,
        email: payload?.data?.email_addresses[0]?.email_address,
        createdAt: new Date(),
        credits: FREE_CREDIT,
        subscription: false,
        storage: FREE_STORAGE,
      }).execute()
      
      if (result) {
        NextResponse.json({ success: true }, { status: 200 })
      }
    } catch (error) {
      console.error('Error: Could not process webhook:', error)
      return new Response('Error: Could not process webhook', {
        status: 500,
      })
      
    } finally {
      database.release()
    }
  }

  return new Response('Webhook received', { status: 200 })
}