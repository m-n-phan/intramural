// supabase/functions/clerk-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Webhook } from 'https://esm.sh/svix@1.24.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define the shape of the Clerk user data we expect.
// You can extend this based on your needs.
interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: { email_address: string; id: string }[];
  image_url: string;
}

// Define the shape of the webhook event payload.
interface WebhookEvent {
  data: Record<string, any>;
  object: 'event';
  type: 'user.created' | 'user.updated' | 'user.deleted';
}

serve(async (req) => {
  try {
    const WEBHOOK_SECRET = Deno.env.get('CLERK_WEBHOOK_SECRET')
    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set in environment variables')
    }

    // 1. Verify the webhook signature
    const headers = req.headers
    const svix_id = headers.get('svix-id')
    const svix_timestamp = headers.get('svix-timestamp')
    const svix_signature = headers.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error: Missing svix headers', { status: 400 })
    }

    const payload = await req.text()
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err.message)
      return new Response('Error: Webhook signature verification failed', { status: 400 })
    }

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 3. Handle the event
    const eventType = evt.type
    const userData = evt.data as ClerkUser;

    console.log(`Received webhook event: ${eventType}`)

    switch (eventType) {
      case 'user.created': {
        const primaryEmail = userData.email_addresses?.[0]?.email_address;

        const { error } = await supabaseAdmin.from('users').insert({
          id: userData.id, // Using Clerk User ID as the primary key
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: primaryEmail,
          profile_image_url: userData.image_url,
          // You can set default values for other columns here if needed
          // e.g., role, onboarding_completed, etc.
        })

        if (error) {
          console.error('Supabase error inserting user:', error)
          return new Response(`Error inserting user: ${error.message}`, { status: 500 })
        }
        break;
      }

      case 'user.updated': {
        const primaryEmail = userData.email_addresses?.[0]?.email_address;

        const { error } = await supabaseAdmin
          .from('users')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: primaryEmail,
            profile_image_url: userData.image_url,
            updated_at: new Date().toISOString(), // Manually update the timestamp
          })
          .eq('id', userData.id)

        if (error) {
          console.error('Supabase error updating user:', error)
          return new Response(`Error updating user: ${error.message}`, { status: 500 })
        }
        break;
      }

      case 'user.deleted': {
        // Clerk's delete payload might only contain the ID
        const { id: userIdToDelete } = evt.data;

        if (!userIdToDelete) {
          return new Response('Error: Missing user ID in delete event', { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userIdToDelete)

        if (error) {
          console.error('Supabase error deleting user:', error)
          return new Response(`Error deleting user: ${error.message}`, { status: 500 })
        }
        break;
      }

      default:
        console.log(`Received unhandled event type: ${eventType}`)
    }

    return new Response('Webhook received successfully', { status: 200 })
  } catch (error) {
    console.error('Internal Server Error:', error.message)
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
  }
})