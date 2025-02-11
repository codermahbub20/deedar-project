// Import required modules
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const bodyParser = require("body-parser");
const connectToMongoDB = require("./src/config/db");

// Import route handlers
const menuRoutes = require("./src/routes/MenuRoutes");
const orderRoutes = require("./src/routes/OrderRoutes");
const revenueRoutes = require("./src/routes/RevenueRutes");
const paymentRoutes = require("./src/routes/PaymentRutes");
const userRoutes = require("./src/routes/UsersRoutes");
const SpecialMenuRoutes = require("./src/routes/SpecialMenuRouter");
const DeliveryLocationRoutes = require("./src/routes/LocationRoutes");
const OpenandcloseRoutes = require("./src/routes/OpenAndCLose");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to match frontend URL
    credentials: true,
  },
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);



// Attach Socket.IO to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Register routes
app.use(menuRoutes);
app.use(orderRoutes);
app.use(revenueRoutes);
app.use(paymentRoutes);
app.use(userRoutes);
app.use(SpecialMenuRoutes);
app.use(OpenandcloseRoutes);
app.use(DeliveryLocationRoutes);

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the Restaurant API");
});

// POS Printing Route
app.post("/print", async (req, res) => {
  const order = req.body;

  try {
    // Auto-detect USB printer
    const devices = escpos.USB.findPrinter();
    if (devices.length === 0) {
      console.error("No USB printer found.");
      return res.status(500).json({ error: "No printer detected. Check USB connection." });
    }

    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open((error) => {
      if (error) {
        console.error("Error opening printer:", error);
        return res.status(500).json({ error: "Failed to connect to printer" });
      }

      try {
        // Print order receipt
        printer
          .font("a")
          .align("ct")
          .style("b")
          .size(1, 1)
          .text("===================================")
          .text("            Deedar UK              ")
          .text("===================================")
          .text(`Address: ${order.address}`)
          .text(`Zip Code: ${order.zipcode}`)
          .text(`Area: ${order.area}`)
          .text(`Contact No: ${order.mobile}`)
          .text("===================================")
          .text(`Order Number: ${order.orderNumber}`)
          .text(`Created At: ${order.createdAt}`)
          .text("===================================");

        // Print table header
        printer.tableCustom([
          { text: "Qty", align: "LEFT", width: 0.2 },
          { text: "Item", align: "CENTER", width: 0.5 },
          { text: "Price", align: "RIGHT", width: 0.3 },
        ]);

        // Print each item
        order.items.forEach((item) => {
          printer.tableCustom([
            { text: item.quantity.toString(), align: "LEFT", width: 0.2 },
            { text: item.name, align: "CENTER", width: 0.5 },
            { text: `£ ${item.price.toFixed(2)}`, align: "RIGHT", width: 0.3 },
          ]);
        });

        // Print totals and payment info
        printer
          .text("===================================")
          .tableCustom([
            { text: "Delivery Charge:", align: "LEFT", width: 0.7 },
            { text: `£ ${order.extraCharge.toFixed(2)}`, align: "RIGHT", width: 0.3 },
          ])
          .tableCustom([
            { text: "Subtotal:", align: "LEFT", width: 0.7 },
            { text: `£ ${order.totalPrice.toFixed(2)}`, align: "RIGHT", width: 0.3 },
          ])
          .tableCustom([
            { text: "Total:", align: "LEFT", width: 0.7 },
            { text: `£ ${order.totalPrice.toFixed(2)}`, align: "RIGHT", width: 0.3 },
          ])
          .text("===================================")
          .text(`Payment Method: ${order.paymentMethod}`)
          .text(`Payment Status: ${order.paymentStatus}`)
          .text("===================================")
          .text("          Customer Copy            ")
          .text("      Thanks for visiting!        ")
          .cut()
          .close();

        res.status(200).json({ message: "Print successful" });
      } catch (printError) {
        console.error("Printing Error:", printError);
        res.status(500).json({ error: "Failed to print receipt" });
      }
    });
  } catch (error) {
    console.error("General Error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  try {
    await connectToMongoDB();
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  } catch (dbError) {
    console.error("❌ Database connection failed:", dbError);
  }
});
