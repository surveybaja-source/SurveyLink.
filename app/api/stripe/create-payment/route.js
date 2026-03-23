import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { amount, currency, missionRef, insurerEmail, expertEmail } = await request.json()

    const platformFee = Math.round(amount * 0.01)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'eur',
      metadata: {
        mission_reference: missionRef,
        insurer_email: insurerEmail,
        expert_email: expertEmail,
        platform_fee: platformFee,
      },
      receipt_email: insurerEmail,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
