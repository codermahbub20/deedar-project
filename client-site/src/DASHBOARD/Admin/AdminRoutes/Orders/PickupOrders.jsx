import { useState, useRef, useEffect } from "react";
// import axios from "axios";
import Swal from "sweetalert2";
import ReactToPrint from "react-to-print";
import { FaTrash, FaPrint, FaCheckCircle } from "react-icons/fa";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";

const PickupOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // Month filter
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataChanged, setDataChanged] = useState(false); // Track changes
  const orderDetailsRef = useRef();
  const axiosSecure = useAxiosSecure();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  // const axiosSecure = useAxiosSecure();

  const handleDeleteMonthlyOrders = () => {
    if (!year || !month) {
      Swal.fire("Error", "Please select both year and month.", "error");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete all orders for ${year}-${month}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/api/orders/month/${year}/${month}`)
          .then((response) => {
            Swal.fire("Deleted!", response.data.message, "success");
          })
          .catch((error) => {
            console.error("Error deleting monthly orders:", error);
            Swal.fire("Error!", "Failed to delete monthly orders.", "error");
          });
      }
    });
  };
  // Fetch and sort orders in descending order when the component mounts or data changes
  useEffect(() => {
    setIsLoading(true);
    axiosSecure
      .get("/api/orders/payment-methods?method=pickup")
      .then((response) => {
        const data = response.data || [];
        // Sort all orders by creation date (descending)
        const sortedOrders = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders); // Initialize filtered orders
      })
      .catch((error) => {
        console.error("Error fetching pickup orders:", error);
        Swal.fire(
          "Error",
          "Failed to fetch orders. Please try again later.",
          "error"
        );
      })
      .finally(() => setIsLoading(false));
  }, [dataChanged]); // Refresh when dataChanged changes

  // Handle month filter change
  const handleMonthChange = (event) => {
    const selectedMonth = event.target.value;
    setSelectedMonth(selectedMonth);

    if (selectedMonth === "") {
      setFilteredOrders(orders); // Reset to all orders if no month is selected
    } else {
      const monthIndex = parseInt(selectedMonth, 10);
      const filtered = orders.filter((order) => {
        const orderMonth = new Date(order.createdAt).getMonth() + 1; // JavaScript months are 0-indexed
        return orderMonth === monthIndex;
      });

      setFilteredOrders(filtered);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/api/orders/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "Order has been deleted.", "success");
            setDataChanged((prev) => !prev); // Toggle dataChanged to trigger refresh
          })
          .catch((error) => {
            console.error("Error deleting order:", error);
            Swal.fire("Error!", "Failed to delete order.", "error");
          });
      }
    });
  };

  const handleUpdatePaymentStatus = (id) => {
    axiosSecure
      .patch(`/api/orders/${id}/payment-status`, {
        paymentStatus: "success",
      })
      .then(() => {
        Swal.fire("Updated!", "Payment status has been updated.", "success");
        setDataChanged((prev) => !prev); // Toggle dataChanged to trigger refresh
      })
      .catch((error) => {
        console.error("Error updating payment status:", error);
        Swal.fire("Error!", "Failed to update payment status.", "error");
      });
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleRowClick = (order) => setSelectedOrder(order);

  return (
    <div className="overflow-x-auto mt-8 text-black">
      {isLoading && <p>Loading...</p>}
      <h2 className="text-2xl font-semibold mb-4">Pick Up Orderssss</h2>

      {/* Month Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="monthFilter" className="mr-2 font-semibold">
          Filter by Month:
        </label>
        <select
          id="monthFilter"
          className="border px-4 py-2 rounded"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Delete Monthly Orders</h2>

          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="year" className="block mb-2 font-medium">
                Year
              </label>
              <input
                id="year"
                type="number"
                className="p-2 border rounded-md bg-white"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <label htmlFor="month" className="block mb-2 font-medium">
                Month
              </label>
              <select
                id="month"
                className="p-2 border rounded-md bg-white"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select a month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")} -{" "}
                    {new Date(0, m - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDeleteMonthlyOrders}
              className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete Orders
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table Section */}
        <div className="flex-1">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Order Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Payment Status</th>
                <th className="px-4 py-2 text-left">Spicy Level</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-4 py-2">
                      {formatDate(order?.createdAt)}
                    </td>
                    <td className="px-4 py-2">${order?.totalPrice}</td>
                    <td className="px-4 py-2">{order?.paymentStatus}</td>
                    <td className="px-4 py-2">{order?.spiceLevel}</td>
                    <td className="px-4 py-2 flex space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order._id);
                        }}
                        className="text-black hover:text-red-600"
                        title="Delete Order"
                      >
                        <FaTrash size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="text-blue-500 hover:text-blue-600"
                        title="Print Order"
                      >
                        <FaPrint size={18} />
                      </button>
                      {order.paymentStatus === "unpaid" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdatePaymentStatus(order._id);
                          }}
                          className="text-green-500 hover:text-green-600"
                          title="Confirm Payment"
                        >
                          <FaCheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Print Preview Section */}
        {selectedOrder ? (
          <div>
            <div
              ref={orderDetailsRef}
              style={{
                fontFamily: "monospace",
                width: "300px",
                margin: "auto",
                padding: "20px",
                border: "1px solid black",
                background: "#fff",
              }}
            >
              {/* Header */}
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Deedar Express Uk
              </h2>
              <p className="text-center">Address:{selectedOrder?.address}</p>
              <p className="text-center">Zip Code:{selectedOrder?.zipcode}</p>
              <p
                style={{
                  textAlign: "center",
                  margin: "5px 0",
                  fontSize: "12px",
                }}
              ></p>
              <hr />

              {/* Order Details */}
              <h3 style={{ textAlign: "center", margin: "5px 0" }}>
                Order: {selectedOrder._id}
              </h3>
              <p style={{ fontSize: "12px", margin: "5px 0" }}>
                CreatedAt:
                {selectedOrder.createdAt} {selectedOrder.time}
              </p>
              <hr />

              {/* Items */}
              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  marginBottom: "10px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Qty</th>
                    <th style={{ textAlign: "left" }}>Item</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.quantity}</td>
                      <td>{item.name}</td>
                      <td style={{ textAlign: "right" }}>€ {item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr />

              {/* Payment Details */}
              <p style={{ fontSize: "12px" }}>
                {selectedOrder.paymentMethod} {selectedOrder.paymentStatus}
              </p>
              <table style={{ width: "100%", fontSize: "12px" }}>
                <tbody>
                  <tr>
                    <td>Subtotal:</td>
                    <td style={{ textAlign: "right" }}>
                      € {selectedOrder.totalPrice}
                    </td>
                  </tr>
                  <tr>
                    <td>Total:</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      € {selectedOrder.totalPrice}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: "12px", marginTop: "10px" }}>
                Transaction Type: {selectedOrder.paymentMethod} <br />
                Authorization: {selectedOrder.paymentStatus} <br />
                {/* Payment Code: {selectedOrder.payment.paymentCode} <br /> */}
                Payment ID: {selectedOrder._id} <br />
              </p>
              <hr />

              {/* Tip Section */}
              <p style={{ fontSize: "12px", margin: "10px 0" }}>
                + Tip: _____________
              </p>
              <p style={{ fontSize: "12px", marginBottom: "10px" }}>
                = Total: _____________
              </p>
              <p style={{ textAlign: "center" }}>
                X _______________________________
              </p>
              <hr />

              {/* Footer */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  marginTop: "10px",
                }}
              >
                Customer Copy <br />
                Thanks for visiting <br />
                {selectedOrder.restaurantName}
              </p>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <ReactToPrint
                trigger={() => (
                  <button
                    className="bg-red-500"
                    style={{ padding: "10px 20px" }}
                  >
                    Print
                  </button>
                )}
                content={() => orderDetailsRef.current}
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontFamily: "monospace",
                width: "300px",
                margin: "auto",
                padding: "20px",
                border: "1px solid black",
                background: "#fff",
              }}
            >
              {/* Header */}
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Deedar Express Uk
              </h2>
              <p className="text-center">Address:-------</p>
              <p className="text-center">Zip Code:-------</p>
              <p className="text-center">Area-------</p>
              <p className="text-center">Contact No:-------</p>
              <p
                style={{
                  textAlign: "center",
                  margin: "5px 0",
                  fontSize: "12px",
                }}
              ></p>
              <hr />

              {/* Order Details */}
              <h3 style={{ textAlign: "center", margin: "5px 0" }}>
                Order Number:-------
              </h3>
              <p style={{ fontSize: "12px", margin: "5px 0" }}>
                CreatedAt: -------
              </p>
              <hr />

              {/* Items */}
              <table>
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Item Name</th>
                    <th>Sub Items</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* Quantity */}
                    <td>-------</td>

                    {/* Item Name */}
                    <td>-------</td>

                    {/* Sub Items */}
                    <td>
                      <ul>
                        <li>-------</li>
                      </ul>
                    </td>

                    {/* Price */}
                    <td style={{ textAlign: "right" }}>£-------</td>
                  </tr>
                </tbody>
              </table>

              <hr />

              {/* Payment Details */}
              <p style={{ fontSize: "12px" }}>-------</p>
              <table style={{ width: "100%", fontSize: "12px" }}>
                <tbody>
                  <tr>
                    <td>Delivery Charge:</td>
                    <td style={{ textAlign: "right" }}>£ -------</td>
                  </tr>
                  <tr>
                    <td>Subtotal:</td>
                    <td style={{ textAlign: "right" }}>£ -------</td>
                  </tr>
                  <tr>
                    <td>Total:</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      £-------
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: "12px", marginTop: "10px" }}>
                Transaction Type:------- <br />
                Authorization: ------- <br />
                {/* Payment Code: {selectedOrder.payment.paymentCode} <br /> */}
                Payment ID: ------- <br />
              </p>
              <hr />

              {/* Tip Section */}
              <p style={{ fontSize: "12px", margin: "10px 0" }}>
                + Tip: _____________
              </p>
              <p style={{ fontSize: "12px", marginBottom: "10px" }}>
                = Total: _____________
              </p>
              <p style={{ textAlign: "center" }}>
                X _______________________________
              </p>
              <hr />

              {/* Footer */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  marginTop: "10px",
                }}
              >
                Customer Copy <br />
                Thanks for visiting <br />
                -------
              </p>
            </div>
            {/* <div style={{ textAlign: "center", marginTop: "20px" }}>
          <ReactToPrint
            trigger={() => (
              <button
                className="bg-red-500"
                style={{ padding: "10px 20px" }}
              >
                Print
              </button>
            )}
            content={() => orderDetailsRef.current}
          />
        </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupOrder;
