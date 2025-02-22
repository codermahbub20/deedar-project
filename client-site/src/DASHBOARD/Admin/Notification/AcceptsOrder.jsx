import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Notifications from "./Notifications";

const AcceptOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState("30");
  const [selectedReason, setSelectedReason] = useState("Out of Stock");
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axiosSecure.get("/api/orders/pending");
        setOrders(response.data); // Assuming the data you need is in the response body
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);
  // Accept order and set preparation time
  const handleAccept = async (orderId) => {
    if (!selectedTime) {
      alert("Please select a time before accepting!");
      return;
    }

    try {
      const response = await axiosSecure.patch(
        `/api/orders/${orderId}`,
        {
          time: selectedTime,
          status: "Preparing",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedOrder = response.data;
        Swal.fire({
          title: "Order Updated!",
          text: `Order #${updatedOrder.orderNumber} status updated to Preparing.`,
          icon: "success",
        });
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== updatedOrder._id)
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: "There was an issue updating the order.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        title: "Failed!",
        text: "Failed to update order status.",
        icon: "error",
      });
    }
  };

  // Reject order with reason
  const handleReject = async (orderId) => {
    if (!selectedReason) {
      alert("Please select a reason for rejection!");
      return;
    }

    try {
      const response = await axiosSecure.patch(
        `/api/orders/${orderId}`,
        {
          status: "Rejected",
          reason: selectedReason,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedOrder = response.data;
        Swal.fire({
          title: "Order Rejected",
          text: `Order #${updatedOrder.orderNumber} has been rejected.`,
          icon: "info",
        });
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== updatedOrder._id)
        );
      } else {
        Swal.fire({
          title: "Error!",
          text: "There was an issue rejecting the order.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      Swal.fire({
        title: "Failed!",
        text: "Failed to reject order.",
        icon: "error",
      });
    }
  };

  if (loading) {
    return <div>Loading pending orders...</div>;
  }
  console.log(orders, "orders");
  return (
    <div className="p-4 text-black">
      <Notifications/>
      <h3 className="text-2xl font-bold mb-4">Pending Orders</h3>
      {orders.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 
        lg:grid-cols-3 gap-4 min-w-96 md:min-w-[500px] "
        >
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 min-w-96 shadow-md bg-white"
            >
              <h4 className="text-xl font-semibold mb-2">
                Order #{order.orderNumber}
              </h4>

              <div className="border-b-2 mb-2 pb-2">
                {" "}
                <p>
                  <strong>User Email:</strong> {order.userEmail}
                </p>
                <p>
                  <strong>Total Price:</strong> £{order.totalPrice.toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>reason:</strong> {order.reason ? order.reason : ""}
                </p>
                <h5 className="font-medium mt-3">Items:</h5>
                {order.items.map((item, index) => (
                  <span className="flex text-xs flex-wrap gap-1" key={index}>
                    {item.subItems.length > 0 &&
                      item.subItems?.map((subItem) => subItem.name).join(", ")}
                    {item.name}{" "}
                    {item.subItems.map((subItem, idx) => (
                      <span className=" text-xs" key={idx}>
                        {subItem.name}
                      </span>
                    ))}{" "}
                    <span className="text-[8px]">
                      variant :`({item.variant}) ` spicelevel:`({item.spiceName}
                      )`
                    </span>
                    (x{item.quantity})
                  </span>
                ))}
              </div>
              <div className="flex justify-between">
                {/* Accept Section */}
                <div className="w-1/2 border-r border-gray-300 pr-4">
                  <h2 className="text-lg font-semibold mb-2">Accept</h2>
                  <div className="flex flex-col gap-2 h-20 overflow-y-auto">
                    {["15", "30", "45", "50"].map((time) => (
                      <span
                        key={time}
                        className={` px-4 rounded-lg text-center  ${
                          selectedTime === time
                            ? "border-2 border-orange-800"
                            : "bg-gray-100 hover:border-orange-200 hover:border-2"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAccept(order._id)}
                    className="w-full py-2 mt-4 border-2
                     border-green-500 hover:bg-green-700 text-red rounded-lg font-semibold"
                  >
                    Accept
                  </button>
                </div>

                {/* Reject Section */}
                <div className="w-1/2 pl-4">
                  <h2 className="text-lg font-semibold mb-2">Reject</h2>
                  <div className="flex flex-col gap-2 h-20 overflow-y-auto">
                    {[
                      "Too Busy",
                      "Out of Stock",
                      "Too Far",

                      "Closed Today",
                      "Please Call",
                    ].map((reason) => (
                      <span
                        key={reason}
                        className={` px-4 rounded-lg text-center ${
                          selectedReason === reason
                            ? "border-2 border-green-800"
                            : "bg-gray-100 hover:bg-green-200"
                        }`}
                        onClick={() => setSelectedReason(reason)}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleReject(order._id)}
                    className="w-full py-2 mt-4 border-2
                     border-red-500 hover:bg-red-700 text-red rounded-lg font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No pending orders found.</p>
      )}
    </div>
  );
};

export default AcceptOrder;
