import { useEffect, useState } from "react";
import useAuth from "../../Hooks/useAuth";
import TableRow from "./TableRow";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (!user?.email) return;

    const fetchUserOrders = async () => {
      try {
        const response = await axiosSecure.get(`api/orders/user`, {
          params: { email: user.email },
        });
        setOrders(response.data);
      } catch (error) {
        console.error(
          "Error fetching user orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders(); // Initial fetch

    const interval = setInterval(fetchUserOrders, 1000); // Fetch every second

    return () => clearInterval(interval); // Cleanup function to clear interval on unmount
  }, [user?.email]);

  if (loading) return <p>Loading...</p>;
  // if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="container mx-auto w-full px-4 sm:px-8">
      <div className="py-8">
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th
                    className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left 
                  text-sm uppercase font-normal"
                  >
                    Item Name
                  </th>
                  <th
                    className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left 
                  text-sm uppercase font-normal"
                  >
                    Quantity
                  </th>
                  <th
                    className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm 
                  uppercase font-normal"
                  >
                    Price
                  </th>
                  <th
                    className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm
                   uppercase font-normal"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id} order={order} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
