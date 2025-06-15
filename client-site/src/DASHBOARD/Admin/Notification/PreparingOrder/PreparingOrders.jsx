import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
// import dynamic from 'next/dynamic'; // Only needed if using Next.js

const PreparingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ReactToPrint, setReactToPrint] = useState(null);
  const orderDetailsRef = useRef();
  const axiosSecure = useAxiosSecure();

  // Dynamically import ReactToPrint on client side
  useEffect(() => {
    import("react-to-print").then((module) => {
      setReactToPrint(() => module.default);
    });
  }, []);

  useEffect(() => {
    const fetchPreparingOrders = async () => {
      try {
        const response = await axiosSecure.get("/api/orders/preparing");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching preparing orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreparingOrders();
  }, []);

  const calculateRemainingTime = (updatedAt, preparationTime) => {
    const now = new Date();
    const updatedTime = new Date(updatedAt);
    const totalSeconds = preparationTime * 60;
    const elapsedSeconds = Math.floor((now - updatedTime) / 1000);
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) => [...prevOrders]);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateOrderStatus = async (orderId) => {
    try {
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      const response = await axiosSecure.patch(`/api/orders/${orderId}/expire`);
      
      if (response.status === 200) {
        Swal.fire({
          title: "Order Done!",
          text: "The order status has been updated to Done.",
          icon: "success",
        });
      } else {
        setOrders((prevOrders) => [...prevOrders, { _id: orderId }]);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setOrders((prevOrders) => [...prevOrders, { _id: orderId }]);
    }
  };

  const addTimeToOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Extend Time?",
      text: "Are you sure you want to add 5 more minutes to this order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Add Time!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const currentOrder = orders.find((order) => order._id === orderId);
        const [minutes, seconds] = calculateRemainingTime(
          currentOrder.updatedAt,
          currentOrder.time
        ).split(":").map(Number);
        const currentSeconds = minutes * 60 + seconds;
        const newTotalSeconds = currentSeconds + 5 * 60;
        const newMinutes = Math.floor(newTotalSeconds / 60);

        const response = await axiosSecure.patch(`/api/orders/${orderId}`, {
          time: newMinutes,
          updatedAt: new Date().toISOString(),
        });

        if (response.status === 200) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId
                ? {
                    ...order,
                    time: newMinutes,
                    updatedAt: new Date().toISOString(),
                  }
                : order
            )
          );

          Swal.fire({
            title: "Time Extended!",
            text: "5 minutes have been added to the preparation time.",
            icon: "success",
          });
        }
      } catch (error) {
        console.error("Error updating order time:", error.response?.data || error.message);
        Swal.fire({
          title: "Error!",
          text: "Failed to add extra time to the order.",
          icon: "error",
        });
      }
    }
  };

  const handleRowClick = (order) => setSelectedOrder(order);

  if (loading) {
    return <div>Loading preparing orders...</div>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3">
      <div className="p-4 text-white col-span-2">
        <h3 className="text-2xl font-bold mb-4">Preparing Orders</h3>
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 text-black lg:grid-cols-2 gap-4">
            {orders.map((order) => (
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
                  <div className="flex text-xs flex-wrap gap-1" key={index}>
                    {item.subItems?.length > 0 &&
                      item.subItems.map((subItem) => subItem.name).join(", ")}
                    {item.name}{" "}
                    {item.subItems?.map((subItem, idx) => (
                      <div key={idx}>
                        <span className="text-xs">{subItem.name}</span>
                      </div>
                    ))}
                    <span>
                      variant: ({item.variant}) spicelevel: ({item.spiceName})
                    </span>
                    (x{item.quantity})
                  </div>
                ))}
                <div className="mt-3">
                  <h5 className="font-medium text-black">
                    Remaining Time:{" "}
                    {calculateRemainingTime(order.updatedAt, order.time)}
                  </h5>
                  <p>{order.status}</p>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <button
                    onClick={() => updateOrderStatus(order._id)}
                    className="mt-3 border-2 border-green-300 text-green-600 py-1 px-3 rounded"
                  >
                    DONE
                  </button>
                  <button
                    onClick={() => handleRowClick(order)}
                    className="mt-3 border-2 border-green-300 text-green-600 py-1 px-3 rounded"
                  >
                    PRINT
                  </button>
                  <button
                    onClick={() => addTimeToOrder(order._id)}
                    className="mt-3 border-2 border-blue-300 text-blue-600 py-1 px-3 rounded"
                  >
                    +5 Minutes
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No preparing orders found.</p>
        )}
      </div>

      <div className="mt-16">
        {selectedOrder ? (
          <div>
            <div
              ref={orderDetailsRef}
              style={{
                fontFamily: "monospace",
                width: "95mm",
                margin: "0 auto",
                padding: "10px",
                background: "#fff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              <h2 style={{ textAlign: "center", margin: "0", fontSize: "18px" }}>
                Deedar Express Uk
              </h2>
              <p className="text-center" style={{ fontSize: "12px" }}>
                Address: {selectedOrder.address || 'N/A'}
              </p>
              <p className="text-center" style={{ fontSize: "12px" }}>
                Zip Code: {selectedOrder.zipcode || 'N/A'}
              </p>
              <p className="text-center" style={{ fontSize: "12px" }}>
                Area: {selectedOrder.area || 'N/A'}
              </p>
              <p className="text-center" style={{ fontSize: "12px" }}>
                Contact No: {selectedOrder.mobile || 'N/A'}
              </p>
              <hr style={{ margin: "10px 0" }} />

              <h3 style={{ textAlign: "center", margin: "10px 0", fontSize: "16px" }}>
                Order Number: {selectedOrder.orderNumber}
              </h3>
              <p style={{ fontSize: "12px", margin: "5px 0" }}>
                CreatedAt:{" "}
                {new Date(selectedOrder.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <hr style={{ margin: "10px 0" }} />

              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "5px" }}>Quantity</th>
                    <th style={{ textAlign: "left", padding: "5px" }}>Item Name</th>
                    <th style={{ textAlign: "left", padding: "5px" }}>Sub Items</th>
                    <th style={{ textAlign: "right", padding: "5px" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "5px" }}>{item.quantity}</td>
                      <td style={{ padding: "5px" }}>
                        {item.name}
                        {item.variant && ` (${item.variant})`}
                        {item.spiceName && ` - ${item.spiceName}`}
                      </td>
                      <td style={{ padding: "5px" }}>
                        {item.subItems?.length > 0 && (
                          <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                            {item.subItems.map((subItem, subIndex) => (
                              <li key={subIndex}>{subItem.name}</li>
                            ))}
                          </ul>
                        )}
                        {item.extraItems?.length > 0 && (
                          <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                            {item.extraItems.map((extraItem, extraIndex) => (
                              <li key={extraIndex}>{extraItem.name}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td style={{ textAlign: "right", padding: "5px" }}>
                        £{item.price ? parseFloat(item.price).toFixed(2) : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <hr style={{ margin: "10px 0" }} />

              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>Delivery Charge:</td>
                    <td style={{ textAlign: "right" }}>
                      £{selectedOrder.extraCharge ? parseFloat(selectedOrder.extraCharge).toFixed(2) : "0.00"}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ textAlign: "left" }}>Spicy Charge:</td>
                    <td style={{ textAlign: "right" }}>
                      £{selectedOrder.items?.reduce((total, item) => {
                        return total + (item.spicePrice ? parseFloat(item.spicePrice) : 0);
                      }, 0).toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ textAlign: "left" }}>Subtotal:</td>
                    <td style={{ textAlign: "right" }}>
                      £{selectedOrder.totalPrice ? parseFloat(selectedOrder.totalPrice).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "bold",textAlign:"left" }}>Total:</td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      £{selectedOrder.totalPrice ? parseFloat(selectedOrder.totalPrice).toFixed(2) : "0.00"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: "12px", marginTop: "10px" }}>
                Transaction Type: {selectedOrder.paymentMethod || 'N/A'} <br />
                Authorization: {selectedOrder.paymentStatus || 'N/A'} <br />
                Payment ID: {selectedOrder._id || 'N/A'} <br />
              </p>
              <hr style={{ margin: "10px 0" }} />

              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  marginTop: "10px",
                }}
              >
                Customer Copy <br />
                Thanks for visiting <br />
                {selectedOrder.restaurantName || 'Deedar Express Uk'}
              </p>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              {ReactToPrint && (
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
                      size: 95mm auto;
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
              )}
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
                <h2 style={{ textAlign: "center", margin: "0", fontSize: "18px" }}>
                  Deedar Express Uk
                </h2>
                <p className="text-center" style={{ fontSize: "12px" }}>
                  Address: N/A
                </p>
                <p className="text-center" style={{ fontSize: "12px" }}>
                  Zip Code: N/A
                </p>
                <p className="text-center" style={{ fontSize: "12px" }}>
                  Area: N/A
                </p>
                <p className="text-center" style={{ fontSize: "12px" }}>
                  Contact No: N/A
                </p>
                <hr style={{ margin: "10px 0" }} />

                <h3 style={{ textAlign: "center", margin: "10px 0", fontSize: "16px" }}>
                  Order Number: N/A
                </h3>
                <p style={{ fontSize: "12px", margin: "5px 0" }}>
                  CreatedAt: N/A
                </p>
                <hr style={{ margin: "10px 0" }} />

                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "5px" }}>Quantity</th>
                      <th style={{ textAlign: "left", padding: "5px" }}>Item Name</th>
                      <th style={{ textAlign: "left", padding: "5px" }}>Sub Items</th>
                      <th style={{ textAlign: "right", padding: "5px" }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "5px" }}>N/A</td>
                      <td style={{ padding: "5px" }}>N/A</td>
                      <td style={{ padding: "5px" }}>
                        <ul style={{ paddingLeft: "15px", fontSize: "11px" }}>
                          <li>N/A</li>
                        </ul>
                      </td>
                      <td style={{ textAlign: "right", padding: "5px" }}>£0.00</td>
                    </tr>
                  </tbody>
                </table>
                <hr style={{ margin: "10px 0" }} />

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
                      <td style={{ textAlign: "right" }}>£0.00</td>
                    </tr>
                    <tr>
                      <td>Spicy Charge:</td>
                      <td style={{ textAlign: "right" }}>£0.00</td>
                    </tr>
                    <tr>
                      <td>Subtotal:</td>
                      <td style={{ textAlign: "right" }}>£0.00</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>Total:</td>
                      <td style={{ textAlign: "right", fontWeight: "bold" }}>£0.00</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ fontSize: "12px", marginTop: "10px" }}>
                  Transaction Type: N/A <br />
                  Authorization: N/A <br />
                  Payment ID: N/A <br />
                </p>
                <hr style={{ margin: "10px 0" }} />

                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  Customer Copy <br />
                  Thanks for visiting <br />
                  Deedar Express Uk
                </p>
              </div>
            </div>
          </span>
        )}
      </div>
    </div>
  );
};

export default PreparingOrders;