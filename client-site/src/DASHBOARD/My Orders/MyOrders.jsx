import { useEffect, useRef, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import ReactToPrint from "react-to-print";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const orderDetailsRef = useRef();

  useEffect(() => {
    if (!user?.email) return;

    const fetchUserOrders = async () => {
      try {
        const response = await axiosSecure.get("/api/orders/user", {
          params: { email: user.email },
        });
        setOrders(response.data);
      } catch (error) {
        console.error(
          "Error fetching orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    const pollOrders = async () => {
      await fetchUserOrders();
      setTimeout(pollOrders, 1); // Millisecond interval
    };

    pollOrders();

    return () => clearTimeout(pollOrders);
  }, [user?.email]);

  // Modify your calculateRemainingTime function
  const calculateRemainingTime = (
    updatedAt,
    preparationTime,
    extendedTime = 0
  ) => {
    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const totalSeconds = (preparationTime + extendedTime) * 60;
    const elapsedSeconds = Math.floor((now - updatedTime) / 1000);
    const remainingSeconds = totalSeconds - elapsedSeconds;

    // Return "00:00" if time has expired
    if (remainingSeconds <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          remainingTime: calculateRemainingTime(
            order.updatedAt,
            order.time,
            order.extendedTime || 0
          ),
          displayTime: order.time + (order.extendedTime || 0),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const getStatusDisplay = (status) => {
    if (status === "Expired") {
      return <span className="text-green-600 font-bold">Order Done</span>;
    }

    // const timeDisplay = remainingTime === "00:00" ? "00:00" : remainingTime;
    return (
      <>
        <p>{status}</p>
      </>
    );
  };

  const handleRowClick = (order) => setSelectedOrder(order);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3">
      <div className="p-4 text-white col-span-2">
        <h3 className="text-2xl font-bold mb-4">Your Upcoming Orders</h3>
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 text-black lg:grid-cols-2 gap-4">
            {orders.map((order) =>
              order.status === "Expired" ? (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 shadow-md bg-white"
                >
                  <h4 className="text-xl font-semibold mb-2">
                    Order #{order.orderNumber}
                  </h4>
                  <p>
                    <strong>User Email:</strong> {order.userEmail}
                  </p>
                  <p>
                    <strong>Total Price:</strong> £
                    {order.totalPrice ? Number(order.totalPrice).toFixed(2) : 0}
                  </p>
                  <p>
                    <strong>Preparation Time:</strong> {order.time} minutes
                  </p>
                  <h5 className="font-medium mt-3">Items:</h5>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex text-xs flex-wrap gap-1">
                      {item.subItems.length > 0 &&
                        item.subItems
                          ?.map((subItem) => subItem.name)
                          .join(", ")}
                      {item.name}{" "}
                      {item.subItems.map((subItem, idx) => (
                        <div key={idx}>
                          <span className="text-xs">{subItem.name}</span>
                        </div>
                      ))}
                      <span>
                        {" "}
                        variant :`({item.variant}) ` spicelevel:`($
                        {item.spiceName}`
                      </span>
                      (x{item.quantity})
                    </div>
                  ))}
                  <div className="mt-3">
                    <h5 className="font-medium text-black">
                      Remaining Time:
                      {order.status === "Expired"
                        ? "00:00"
                        : order.remainingTime}
                    </h5>
                    <p>{getStatusDisplay(order.status)}</p>
                  </div>
                  <div className="flex flex-wrap justify-between items-center">
                    <button
                      onClick={() => handleRowClick(order)}
                      className="mt-3 border-2 border-green-300 text-green-600 py-1 px-3 rounded"
                    >
                      PRINT
                    </button>
                  </div>
                </div>
              ) : (
                ""
              )
            )}
          </div>
        ) : (
          <p>No orders to display</p>
        )}
      </div>
      <div className="mt-16">
        {selectedOrder ? (
          <div>
            <div
              ref={orderDetailsRef}
              style={{
                fontFamily: "monospace",
                width: "100mm",
                minHeight: "auto",
                padding: "15px",
                background: "#fff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                fontSize: "20px",
              }}
            >
              {/* Header */}
              <h2
                style={{ textAlign: "center", margin: "0", fontSize: "18px" }}
              >
                Deedar Express Uk
              </h2>
              <p style={{ fontSize: "12px", textAlign: "center" }}>
                Address: {selectedOrder?.address}
              </p>
              <p style={{ fontSize: "12px", textAlign: "center" }}>
                Zip Code: {selectedOrder?.zipcode}
              </p>
              <p style={{ fontSize: "12px", textAlign: "center" }}>
                Area: {selectedOrder?.area}
              </p>
              <p style={{ fontSize: "12px", textAlign: "center" }}>
                Contact No: {selectedOrder?.mobile}
              </p>
              <hr style={{ margin: "10px 0" }} />

              {/* Order Details */}
              <h3
                style={{
                  textAlign: "center",
                  margin: "10px 0",
                  fontSize: "16px",
                }}
              >
                Order Number: {selectedOrder.orderNumber}
              </h3>
              <p style={{ fontSize: "12px", margin: "5px 0" }}>
                CreatedAt: {selectedOrder.createdAt} {selectedOrder.time}
              </p>
              <hr style={{ margin: "10px 0" }} />

              {/* Items */}
              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "5px" }}>
                      Quantity
                    </th>
                    <th style={{ textAlign: "left", padding: "5px" }}>
                      Item Name
                    </th>
                    <th style={{ textAlign: "left", padding: "5px" }}>
                      Sub Items
                    </th>
                    <th style={{ textAlign: "right", padding: "5px" }}>
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "5px" }}>{item.quantity}</td>
                      <td style={{ padding: "5px" }}>
                        {item.subItem ? item.subItem.name : item.name}
                        {item.variant && ` (${item.variant})`}
                        {item.spiceName && ` -${item.spiceName}`}
                      </td>
                      <td style={{ padding: "5px" }}>
                        {item.subItems && typeof item.subItems === "object" && (
                          <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                            {Object.values(item.subItems).map(
                              (subItem, subIndex) => (
                                <li key={subIndex}>{subItem.name}</li>
                              )
                            )}
                          </ul>
                        )}

                        {item.extraItems && item.extraItems.length > 0 && (
                          <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                            {item.extraItems?.map((extraItem, extraIndex) => (
                              <li key={extraIndex}>{extraItem.name}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td style={{ textAlign: "right", padding: "5px" }}>
                        £{" "}
                        {isNaN(parseFloat(item.price))
                          ? "N/A"
                          : parseFloat(item.price).toFixed(2)}{" "}
                        {item?.spicePrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Payment Details */}
              <p style={{ fontSize: "12px", marginBottom: "5px" }}>
                {selectedOrder.paymentMethod} {selectedOrder.paymentStatus}
              </p>
              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                <tbody>
                  <tr>
                    <td>Delivery Charge:</td>
                    <td style={{ textAlign: "right" }}>
                      £{" "}
                      {isNaN(parseFloat(selectedOrder.extraCharge))
                        ? "N/A"
                        : parseFloat(selectedOrder.extraCharge).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Spicy Charge:</td>
                    {selectedOrder.items.map((item, index) => (
                      <td key={index}>
                        {item.spicePrice && (
                          <span style={{ textAlign: "left" }}>
                            £{" "}
                            {isNaN(parseFloat(item.spicePrice))
                              ? "N/A"
                              : parseFloat(item.spicePrice).toFixed(2)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Subtotal:</td>
                    <td style={{ textAlign: "right" }}>
                      £{" "}
                      {isNaN(parseFloat(selectedOrder?.totalPrice))
                        ? "N/A"
                        : parseFloat(selectedOrder?.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Total:</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      £{" "}
                      {isNaN(parseFloat(selectedOrder.totalPrice))
                        ? "N/A"
                        : parseFloat(selectedOrder.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p style={{ fontSize: "12px", marginTop: "10px" }}>
                Transaction Type: {selectedOrder.paymentMethod} <br />
                Authorization: {selectedOrder.paymentStatus} <br />
                Payment ID: {selectedOrder._id} <br />
              </p>

              <hr style={{ margin: "10px 0" }} />

              {/* Tip Section */}
              <p style={{ fontSize: "12px", margin: "10px 0" }}>
                + Tip: _____________
              </p>
              <p style={{ fontSize: "12px", marginBottom: "10px" }}>
                = Total: _____________
              </p>
              <p style={{ textAlign: "center", fontSize: "12px" }}>
                X _______________________________
              </p>

              <hr style={{ margin: "10px 0" }} />

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
                    className="bg-orange-300 py-2 px-2 rounded-lg"
                    style={{ marginLeft: "10px" }}
                  >
                    Print Customer Copy
                  </button>
                )}
                content={() => orderDetailsRef.current}
                pageStyle={`
                  @page {
                    size: 100mm auto;
                    margin: 0;
                  }
                  body {
                    font-family: monospace;
                    font-size: 20px;
                    margin: 0;
                  }
                  #orderDetails {
                    width: 100mm;
                    font-size: 20px;
                    padding: 5px;
                  }
                `}
              />
            </div>
          </div>
        ) : (
          <span className="text-xl mt-16 text-center font-bold">
            <h3 className="text-2xl font-bold mb-4">Your print preview</h3>
            <div>
              <div
                ref={orderDetailsRef}
                style={{
                  fontFamily: "monospace",
                  width: "350px",
                  margin: "auto",
                  padding: "20px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Header */}
                <h2
                  style={{ textAlign: "center", margin: "0", fontSize: "18px" }}
                >
                  Deedar Express Uk
                </h2>
                <p style={{ fontSize: "12px", textAlign: "center" }}>
                  Address: {selectedOrder?.address}
                </p>
                <p style={{ fontSize: "12px", textAlign: "center" }}>
                  Zip Code: {selectedOrder?.zipcode}
                </p>
                <p style={{ fontSize: "12px", textAlign: "center" }}>
                  Area: {selectedOrder?.area}
                </p>
                <p style={{ fontSize: "12px", textAlign: "center" }}>
                  Contact No: {selectedOrder?.mobile}
                </p>
                <hr style={{ margin: "10px 0" }} />

                {/* Order Details */}
                <h3
                  style={{
                    textAlign: "center",
                    margin: "10px 0",
                    fontSize: "16px",
                  }}
                >
                  Order Number:..............
                </h3>
                <p style={{ fontSize: "12px", margin: "5px 0" }}>
                  CreatedAt: ..............
                </p>
                <hr style={{ margin: "10px 0" }} />

                {/* Items */}
                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "5px" }}>
                        Quantity
                      </th>
                      <th style={{ textAlign: "left", padding: "5px" }}>
                        Item Name
                      </th>
                      <th style={{ textAlign: "left", padding: "5px" }}>
                        Sub Items
                      </th>
                      <th style={{ textAlign: "right", padding: "5px" }}>
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "5px" }}>....</td>
                      <td style={{ padding: "5px" }}>......</td>
                      <td style={{ padding: "5px" }}>
                        <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                          <li>.....</li>
                        </ul>
                      </td>
                      <td style={{ textAlign: "right", padding: "5px" }}>£ </td>
                    </tr>
                  </tbody>
                </table>

                {/* Payment Details */}
                <p style={{ fontSize: "12px", marginBottom: "5px" }}>
                  ..............
                </p>
                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td>Delivery Charge:</td>
                      <td style={{ textAlign: "right" }}>£ </td>
                    </tr>
                    <tr>
                      <td>Spicy Charge:</td>
                      <td>..............</td>
                    </tr>
                    <tr>
                      <td>Subtotal:</td>
                      <td style={{ textAlign: "right" }}>£ </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Total:</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>
                        £{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ fontSize: "12px", marginTop: "10px" }}>
                  Transaction Type:.............. <br />
                  Authorization:.............. <br />
                  Payment ID:..............
                  <br />
                </p>

                <hr style={{ margin: "10px 0" }} />

                {/* Tip Section */}
                <p style={{ fontSize: "12px", margin: "10px 0" }}>
                  + Tip: _____________
                </p>
                <p style={{ fontSize: "12px", marginBottom: "10px" }}>
                  = Total: _____________
                </p>
                <p style={{ textAlign: "center", fontSize: "12px" }}>
                  X _______________________________
                </p>

                <hr style={{ margin: "10px 0" }} />

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
                  .......
                </p>
              </div>
            </div>
          </span>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
