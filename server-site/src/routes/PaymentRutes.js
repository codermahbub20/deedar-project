const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST request to create a Stripe payment intent
router.post('/api/create-payment-intent', async (req, res) => {
  const { totalPrice } = req.body;  // Expect totalPrice in dollars (e.g., 10.00)

  // Validate the amount
  if (!totalPrice || totalPrice <= 0) {
    return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
  }

  try {
    // Convert totalPrice from dollars to cents (Stripe expects the amount in cents)
    const amountInCents = Math.round(totalPrice * 100); // Convert to cents (e.g., $10.00 -> 1000)

    // Create a PaymentIntent with the amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Amount in cents
      currency: 'usd', // Adjust this as needed
    });

    // Send the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
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
