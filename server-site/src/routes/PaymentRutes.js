const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST request to create a Stripe payment intent
router.post('/api/create-payment-intent', async (req, res) => {
  try {
  const { totalPrice, order_id, customer_email } = req.body;
    
    // Validate the amount
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ 
        error: 'Amount is required and must be greater than 0' 
      });
    }

    // Convert totalPrice from dollars to cents
    const amountInCents = Math.round(totalPrice * 100);

    // Create a PaymentIntent with the amount
    // ...existing code...
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'eur',
  metadata: {
    order_id,
    customer_email,
    created_at: new Date().toISOString()
  },
  description: `Order #${order_id}`,
  // REMOVE this line:
  // statement_descriptor: `ORDER-${order_id}`,
  // If you want a suffix, use:
  // statement_descriptor_suffix: "ORDER"
  setup_future_usage: 'off_session'
});

    // Send the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// POST request to capture a PaymentIntent
router.post('/api/capture-payment-intent', async (req, res) => {
  try {
    const { paymentIntentId, amountToCapture } = req.body;
    
    // Validate the amount
    if (!amountToCapture || amountToCapture <= 0) {
      return res.status(400).json({ 
        error: 'Amount to capture is required and must be greater than 0' 
      });
    }

    // Capture the PaymentIntent
    const capture = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: Math.round(amountToCapture * 100),
      application_fee_amount: 0 // Add application fee if needed
    });

    res.status(200).json({
      capture,
      status: capture.status,
      amountCaptured: capture.amount,
      currency: capture.currency
    });
  } catch (error) {
    console.error('Stripe capture error:', error);
    res.status(500).json({ 
      error: 'Failed to capture payment intent',
      details: error.message
    });
  }
});

// Webhook endpoint for payment events
router.post('/api/stripe/webhook', async (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.header('Stripe-Signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      // Update your database with the successful payment
      await updateOrderStatus(paymentIntent.metadata.order_id, 'paid');
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      // Update your database with the failed payment
      await updateOrderStatus(paymentIntent.metadata.order_id, 'failed');
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});
router.get('/api/orders/payment-methods', async (req, res) => {
  try {
    // Aggregate data by paymentMethod
    const paymentStats = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod", // Group by paymentMethod (e.g., "Cash", "Stripe")
          count: { $sum: 1 },   // Count the number of orders per payment method
        },
      },
    ]);
    res.status(200).json(paymentStats);
  } catch (error) {
    console.error('Error fetching payment method statistics:', error);
    res.status(500).json({ message: 'Failed to retrieve payment method statistics', error });
  }
});

module.exports = router;
