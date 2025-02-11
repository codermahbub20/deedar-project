const express = require('express');
const router = express.Router();
const Order = require('../models/OrderScheema'); // Adjust path as needed
const axios = require('axios');
const nodemailer = require("nodemailer");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);


// Function to send a welcome email
const sendWelcomeEmail = async (email, orderNumber, items) => {

  const formattedItems = items
    .map((item, index) => `  ${index + 1}. ${item.name} (x${item.quantity})`)
    .join("\n");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Deedar Express UK Restaurant Order Confirmation 🍴",
    text: `Dear Valued Customer,

Thank you for choosing Deedar Express UK Restaurant! We are delighted to confirm your order.

Here are your order details:
- **Items Ordered:** ${formattedItems}
- **Order Number:** ${orderNumber}

Your satisfaction is our priority, and we’re working hard to prepare your delicious meal. If you have any questions or need assistance, feel free to contact us.

We look forward to serving you again soon!

Warm regards,  
The Deedar Express UK Restaurant Team
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
};


const sendCancellationEmail = async (email, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Order Cancellation Notice - Deedar Express UK Restaurant 🍴",
    text: `Dear Valued Customer,

We regret to inform you that we are unable to process your order due to the following reason:

"${reason}"

We sincerely apologize for any inconvenience caused. Please feel free to reach out to us for assistance or to place a new order.

Thank you for your understanding.

Warm regards,  
The Deedar Express UK Restaurant Team
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send cancellation email to ${email}:`, error);
  }
};


// API endpoint to place an order
router.post("/api/orders", async (req, res) => {
  const {
    orderNumber,
    userEmail,
    chefEmail,
    paymentStatus,
    paymentMethod,
    items,
    totalPrice,
    orderType,
    spiceLevel,
    email,
    address,
    zipcode,
    mobile,
    area,
    extraCharge,
  } = req.body;

  console.log('Items ', items)

  // Validate required fields
  if (!userEmail || !items || items.length === 0 || !totalPrice) {
    return res.status(400).json({
      error: "User email, items, and total price are required",
    });
  }

  try {
    // Create and save the order
    const newOrder = new Order({
      orderNumber,
      userEmail,
      chefEmail,
      paymentStatus,
      paymentMethod,
      orderType,
      items,
      totalPrice,
      status: "Pending",
      reason: 'Ongoing',
      spiceLevel,
      email,
      address,
      zipcode,
      mobile,
      area,
      extraCharge,
    });

    const savedOrder = await newOrder.save();

    // Emit event to all connected clients
    req.io.emit("new-order", savedOrder);

    // Send the welcome email
    // await sendWelcomeEmail(email, orderNumber, items);

    // Respond with success
    res.status(201).json({
      message: "Order placed successfully",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
});
// GET request to fetch all orders
router.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
});

// DELETE request to delete an order by ID
router.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order deleted successfully',
      data: deletedOrder,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});
router.patch('/api/orders/:id/payment-status', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'success' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }



    res.status(200).json({
      message: 'Payment status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});



// GET request to fetch payment method statistics (Cash on Delivery vs Stripe)
router.get('/api/orders/payment-methods', async (req, res) => {
  try {
    const { method } = req.query; // Get method from query params
    const paymentMethods = ['stripe', 'cash', 'pickup'];

    // If method is provided and valid, filter; otherwise, return all
    const query = method && paymentMethods.includes(method)
      ? { paymentMethod: method }
      : { paymentMethod: { $in: paymentMethods } };

    const orders = await Order.find(query).sort({ createdAt: -1 });;
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});
// GET request to fetch pending data 
router.get('/api/orders/pending', async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.status(200).json(pendingOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Failed to fetch pending orders', error });
  }
});
// GET request to fetch preparing data 
router.get('/api/orders/preparing', async (req, res) => {
  try {
    const preparingOrders = await Order.find({ status: 'Preparing' }).sort({ createdAt: -1 });;
    res.status(200).json(preparingOrders);
  } catch (error) {
    console.error('Error fetching preparing orders:', error);
    res.status(500).json({ message: 'Failed to fetch preparing orders', error });
  }
});



// GET request to fetch orders for a specific user (filtered by email)
router.get('/api/orders/user', async (req, res) => {
  const userEmail = req.query.email; // Get user email from query parameters

  if (!userEmail) {
    return res.status(400).json({ message: "User email is required" });
  }

  try {
    // Find orders that match the user's email and sort by creation date
    const userOrders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    res.status(200).json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Error retrieving user orders', error });
  }
});



router.patch("/api/orders/:id", async (req, res) => {
  const { time, status, reason } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order fields
    order.time = time || order.time;
    order.status = status || order.status;
    order.reason = reason || 'Ongoing';

    // Save the updated order
    const updatedOrder = await order.save();

    // Send emails based on the conditions
    if (time !== 1 && !reason) {
      // Send a welcome email if time is available and reason is null
      await sendWelcomeEmail(order.email, order.orderNumber, order.items);
    }

    if (reason) {
      // Send a cancellation email if a reason is provided
      await sendCancellationEmail(order.email, reason);
    }

    res.json(updatedOrder); // Return the updated order data
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      error: "Failed to update order.",
    });
  }
});


router.patch('/api/orders/:id/expire', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Expired' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated to Expired',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status to expired:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});


// DELETE request to delete orders for a specific month
router.delete("/api/orders/month/:year/:month", async (req, res) => {
  const { year, month } = req.params;

  try {
    // Calculate the start and end dates of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Delete orders within the date range
    const result = await Order.deleteMany({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} orders for ${year}-${month}.`,
    });
  } catch (error) {
    console.error("Error deleting orders by month:", error);
    res.status(500).json({ error: "Failed to delete orders for the month." });
  }
});

// PATCH request to update order status to 'Expired' if preparation time exceeds
router.patch('/api/orders/:id/expire', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Expired' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated to Expired',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status to expired:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});



// PATCH request to update order status
router.post('/api/orders/user', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// PATCH request to cancel an order
router.patch('/api/orders/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, { status: 'Canceled' }, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order canceled', order });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({ error: 'Error canceling order' });
  }
});



module.exports = router;