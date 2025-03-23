import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";

const UpcomingOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orders1, setOrders1] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (!user?.email) return;

    const fetchUserOrders = async () => {
      try {
        const response = await axiosSecure.get("/api/orders/user", {
          params: { email: user.email },
        });
        setOrders1(response.data);
      } catch (error) {
        console.error(
          "Error fetching user orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user?.email]);

  console.log("orders222222", orders);

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
  console.log("orders1111111111", orders1);
  // Filter out expired orders
  const filteredOrders = orders.filter(
    (order) => order.status !== "Expired" && order.status !== "Canceled"
  );

  console.log(orders);

  // Calculate remaining time in mm:ss format
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
      setOrders((prevOrders) => {
        return prevOrders.map((order) => ({
          ...order,
          remainingTime: calculateRemainingTime(
            order.updatedAt,
            order.time,
            order.extendedTime || 0
          ),
          displayTime: order.time + (order.extendedTime || 0),
        }));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  return (
    <div className="p-4 text-black">
      {loading && "loading ......."}
      <h3 className="text-2xl font-bold mb-4">Your Upcoming Orders</h3>
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 justify-center align-middle items-center sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const remainingTime = calculateRemainingTime(
              order.updatedAt,
              order.time,
              order.extendedTime || 0
            );

            return (
              <div
                key={order._id}
                className="border rounded-lg p-4 shadow-md bg-orange-100 w-full"
              >
                <div className="mt-3 text-center">
                  {/* Show different messages based on order status */}
                  {order.status === "Preparing" && !order.time && (
                    <p className="text-lg font-medium">
                      Admin will soon accept your order
                    </p>
                  )}

                  {order.status === "Pending" && (
                    <p className="text-lg font-medium">Your order is pending</p>
                  )}

                  {order.status === "Rejected" && order.reason && (
                    <p className="text-lg font-medium text-black">
                      Reason: {order.reason}
                    </p>
                  )}

                  {order.status == "Preparing" &&
                    order.status !== "Pending" && (
                      <>
                        <h5 className="font-medium text-4xl font-chewy text-green-600">
                          {remainingTime}
                        </h5>
                        <div className="text-sm mt-2">
                          Total Time: {order.displayTime} minutes
                          {order.extendedTime > 0 && (
                            <span className="text-blue-600 ml-2">
                              (+{order.extendedTime} mins added)
                            </span>
                          )}
                        </div>
                      </>
                    )}

                  <p>{order.status}</p>
                </div>

                <p>
                  <strong>User Email:</strong> {order.userEmail}
                </p>
                <p>
                  <strong>Original Preparation Time:</strong> {order.time}{" "}
                  minutes
                </p>

                <h5 className="font-medium mt-3">Items:</h5>
                {order.items.map((item, index) => (
                  <span key={index} className="flex text-xs flex-wrap gap-1">
                    {item.subItems.length > 0 &&
                      item.subItems?.map((subItem) => subItem.name).join(", ")}
                    {item.name}{" "}
                    {item.subItems.map((subItem, idx) => (
                      <span key={idx} className="text-xs">
                        {subItem.name}
                      </span>
                    ))}
                    <span>
                      {" "}
                      variant :`({item.variant}) ` spicelevel:`({item.spiceName}
                      `
                    </span>
                    (x{item.quantity})
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div>No orders to display</div>
      )}
    </div>
  );
};

export default UpcomingOrders;
