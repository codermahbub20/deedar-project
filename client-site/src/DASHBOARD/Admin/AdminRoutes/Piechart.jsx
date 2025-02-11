import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const PieCharts = () => {
  const [orderData, setOrderData] = useState([]);
  const axiosSecure = useAxiosSecure();


  useEffect(() => {
    axiosSecure
      .get("/v3/api/orders/order-type")
      .then((response) => {
        setOrderData(response.data); // Assuming the data you need is in the response body
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  // Define the colors for the Pie chart
  const COLORS = ["gray", "green"]; // Blue for online, yellow for pickup

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={orderData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        label
      >
        {orderData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default PieCharts;
