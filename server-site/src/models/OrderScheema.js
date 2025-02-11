const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    chefEmail: { type: String, required: true },

    items: [
      {
        name: String,
        price: String,
        quantity: Number,
        variant: String,
        spiceName:  String ,
        spicePrice: Number,
        subItems: [
          {
            name: String,
          }
        ],
        createdAt: { type: Date, default: Date.now },
        // createdAt: { type: Date, default: new Date('2024-11-13T00:00:00Z') },
      },
    ],
    paymentStatus: { type: String, }, // Required for tracking payment status
    paymentMethod: { type: String, },
    orderType: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    // createdAt: { type: Date, default: Date.now },





    status: { type: String, },
    reason: { type: String, required: true },
    time: { type: Number, },
    email: { type: String, },
    address: { type: String, },
    zipcode: { type: String, },
    mobile: { type: String, },
    area: { type: String, },
    extraCharge: { type: Number, },
    orderNumber: { type: Number, },
    // createdAt: { type: Date, default: new Date('2024-11-13T00:00:00Z') },
  },
  { timestamps: true, default: 30 }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
