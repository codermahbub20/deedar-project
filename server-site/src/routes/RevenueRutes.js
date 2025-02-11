const express = require('express');
const moment = require('moment');
const Order = require('../models/OrderScheema'); // Fixed typo (OrderScheema to OrderSchema)
const router = express.Router();


router.get('/api/revenue/daily', async (req, res) => {
  try {
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          paymentStatus: 'success',
        },
      },
      {
        $addFields: {
          totalPrice: { $toDouble: '$totalPrice' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(revenue.map(({ _id, totalRevenue }) => ({ date: _id, totalRevenue })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily revenue', error: error.message });
  }
});


// GET request for weekly revenue
router.get('/api/revenue/weekly', async (req, res) => {
  try {
    const weekOffset = parseInt(req.query.weekOffset) || 0; // Get week offset from query or default to 0
    const startOfWeek = moment().startOf('week').add(weekOffset, 'weeks').toDate();
    const endOfWeek = moment().endOf('week').add(weekOffset, 'weeks').toDate();

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]);

    res.json(revenue.map(({ _id, totalRevenue }) => ({ date: _id, totalRevenue })));
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});





router.get('/api/revenue/monthly', async (req, res) => {
  try {
    const monthOffset = parseInt(req.query.monthOffset) || 0; // Get month offset from query or default to 0
    const startOfMonth = moment().startOf('month').add(monthOffset, 'months').toDate();
    const endOfMonth = moment().endOf('month').add(monthOffset, 'months').toDate();

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]);

    res.json(revenue.map(({ _id, totalRevenue }) => ({ date: _id, totalRevenue })));
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET request for yearly revenue
router.get('/api/revenue/yearly', async (req, res) => {
  try {
    const yearoffset = parseInt(req.query.yearOffset) || 0;
    const startOfYear = moment().startOf('year').add(yearoffset, 'year').toDate();
    const endOfYear = moment().endOf('year').add(yearoffset, 'year').toDate();

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          paymentStatus: 'success',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, // Group by year-month
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by year-month
    ]);

    res.json(revenue.map(({ _id, totalRevenue }) => ({ month: _id, totalRevenue })));
  } catch (error) {
    console.error('Error fetching yearly revenue:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/v3/api/orders/order-type', async (req, res) => {
  try {
    const orderTypes = ['online', 'pickup']; // Possible order types

    const orders = await Order.aggregate([
      { $match: { orderType: { $in: orderTypes } } },
      { $group: { _id: '$orderType', count: { $sum: 1 } } },
    ]);





    // Format the data to match frontend expectations
    const formattedData = orders.map((order) => ({
      name: order._id.charAt(0).toUpperCase() + order._id.slice(1), // Capitalize the order type (Online, Pickup)
      value: order.count,
    }));

    res.status(200).json(formattedData); // Send the formatted data to the frontend
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});

module.exports = router;