import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Design Tool Pro',
              description: 'Unlimited exports, no watermarks, priority support'
            },
            unit_amount: 1200, // $12.00
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=cancelled`,
      metadata: {
        userId: userId.toString()
      }
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send('Webhook Error');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isProUser: true,
            stripeCustomerId: session.customer as string
          });
          console.log(`User ${userId} upgraded to Pro`);
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { isProUser: false }
        );
        console.log(`Customer ${customerId} downgraded from Pro`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get customer portal
router.post('/customer-portal', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stripeCustomerId = req.user?.stripeCustomerId;

    if (!stripeCustomerId) {
      res.status(400).json({ error: 'No Stripe customer found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Customer portal error:', error);
    res.status(500).json({ error: 'Failed to create customer portal session' });
  }
});

export default router;
