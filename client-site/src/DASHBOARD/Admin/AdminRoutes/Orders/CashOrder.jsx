import { useEffect, useState, useRef } from "react";
// import axios from "axios";
import Swal from "sweetalert2";
import ReactToPrint from "react-to-print";
import { FaTrash, FaPrint, FaCheckCircle } from "react-icons/fa";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";

const CashOrder = () => {
  const [orders, setOrders] = useState([]);
  const [sortedOrders, setSortedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortOption, setSortOption] = useState("descending"); // Default sort option for newest first
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
            window.location.reload();
            Swal.fire("Deleted!", response.data.message, "success");
          })
          .catch((error) => {
            console.error("Error deleting monthly orders:", error);
            Swal.fire("Error!", "Failed to delete monthly orders.", "error");
          });
      }
    });
  };
  console.log(selectedOrder);

  // Fetch orders on component mount
  useEffect(() => {
    axiosSecure
      .get("/api/orders/payment-methods?method=cash")
      .then((response) => {
        const fetchedOrders = response.data || [];
        setOrders(fetchedOrders);
        sortOrders(fetchedOrders, sortOption); // Sort immediately after fetching
      })
      .catch((error) => {
        console.error("Error fetching Cash on delivery orders:", error);
        Swal.fire(
          "Error",
          "Failed to fetch orders. Please try again later.",
          "error"
        );
      });
  }, [sortOption]);

  // Sort Orders Based on Sort Option
  const sortOrders = (orders, option) => {
    let sorted = [...orders];

    if (option === "ascending") {
      // Sort by ascending order of createdAt
      sorted = sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (option === "descending") {
      // Sort by descending order of createdAt
      sorted = sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setSortedOrders(sorted);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    sortOrders(orders, e.target.value);
  };

  const handlePrint = () => {
    axiosSecure
      .post("/print", selectedOrder)
      .then((response) => {
        console.log(response.data.message);
        alert("Printed successfully!");
      })
      .catch((error) => {
        console.error("Error printing:", error);
        alert("Failed to print!");
      });
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
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              setOrders((prevOrders) =>
                prevOrders.filter((order) => order._id !== id)
              );
              window.location.reload();
              Swal.fire("Deleted!", "Order has been deleted.", "success");
            } else {
              throw new Error("Unexpected response from server");
            }
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, paymentStatus: "success" } : order
          )
        );
        Swal.fire("Updated!", "Payment status has been updated.", "success");
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
      <h2 className="text-2xl font-semibold mb-4">COD Orders</h2>

      {/* Sorting Dropdown */}
      <div className="  lg:flex items-center mb-4">
        <label htmlFor="sort" className="mr-4 font-medium">
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOption}
          onChange={handleSortChange}
          className="p-2 border rounded-md"
        >
          <option value="descending">Date (Newest First)</option>
          <option value="ascending">Date (Oldest First)</option>
        </select>
      </div>
      <div className="mt-8 mb-5">
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
            className="p-2 mt-8 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete Orders
          </button>
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
                {/* <th className="px-4 py-2 text-left">Spicy Level</th> */}
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-4 py-2">
                      {formatDate(order?.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      ${order?.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{order?.paymentStatus}</td>
                    {/* <td className="px-4 py-2">{order?.spiceLevel}</td> */}
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
                      {order.paymentStatus === "pending" && (
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
        {selectedOrder && (
          <div>
            {/* Order Details */}
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
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Deedar Express Uk
              </h2>
              <p>Address: {selectedOrder.address}</p>
              <p>Zip Code: {selectedOrder.zipcode}</p>
              <p>Area: {selectedOrder.area}</p>
              <p>Contact No: {selectedOrder.mobile}</p>
              <h3>Order Number: {selectedOrder.orderNumber}</h3>
              <p>CreatedAt: {selectedOrder.createdAt}</p>
              <hr />
              <table>
                <thead>
                  <tr>
                    <th>Qty</th>
                    <th>Item</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.quantity}</td>
                      <td>
                        {item.name}({item?.variant})
                      </td>
                      <td>£ {item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>Delivery Charge: £ {selectedOrder.extraCharge}</p>
              <p>Total: £ {selectedOrder.totalPrice.toFixed(2)}</p>
              <p>Payment Method: {selectedOrder.paymentMethod}</p>
              <p>Payment Status: {selectedOrder.paymentStatus}</p>
            </div>

            {/* Print Button */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="bg-orange-300 py-2 px-2 rounded-lg"
                onClick={handlePrint}
              >
                Print via POS
              </button>
              <ReactToPrint
                trigger={() => (
                  <button
                    className="bg-orange-300 py-2 px-2 rounded-lg"
                    style={{ marginLeft: "10px" }}
                  >
                    Print Customer Copy
                  </button>
                )}
                content={() => orderDetailsRef.current}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashOrder;
