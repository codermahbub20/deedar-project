import { useEffect, useState } from "react";
// import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { FaChartLine, FaCalendarAlt } from "react-icons/fa";
import Piecharts from "./Piechart";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const AdminProfile = () => {
  const axiosSecure = useAxiosSecure();

  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);

  const daysOfWeek = ["Sat", "Sun", "Mon", "Tues", "Wed", "Thurs", "Fri"];
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getWeekDateRange = (offset = 0) => {
    const currentDate = new Date();
    const firstDayOfWeek = new Date(
      currentDate.setDate(
        currentDate.getDate() - currentDate.getDay() + offset * 7
      )
    );
    const lastDayOfWeek = new Date(
      currentDate.setDate(firstDayOfWeek.getDate() + 6)
    );

    return {
      start: `${
        monthsOfYear[firstDayOfWeek.getMonth()]
      } ${firstDayOfWeek.getDate()}, ${firstDayOfWeek.getFullYear()}`,
      end: `${
        monthsOfYear[lastDayOfWeek.getMonth()]
      } ${lastDayOfWeek.getDate()}, ${lastDayOfWeek.getFullYear()}`,
    };
  };

  const getMonthName = (offset = 0) => {
    const currentMonth = new Date().getMonth();
    return `${
      monthsOfYear[(currentMonth + offset + 12) % 12]
    } ${new Date().getFullYear()}`;
  };

  // const getYearMonthLabel = () => `${new Date().getFullYear()} - ${monthsOfYear[new Date().getMonth()]}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daily, weekly, monthly, yearly] = await Promise.all([
          axiosSecure.get("/api/revenue/daily"),
          axiosSecure.get(
            `/api/revenue/weekly?weekOffset=${weekOffset}`
          ),
          axiosSecure.get(
            `/api/revenue/monthly?monthOffset=${monthOffset}`
          ),
          axiosSecure.get(
            `/api/revenue/yearly?yearOffset=${yearOffset}`
          ),
        ]);
        setDailyRevenue(daily.data);
        setWeeklyRevenue(weekly.data);
        setMonthlyRevenue(monthly.data);
        setYearlyRevenue(yearly.data);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }
    };
    fetchData();
  }, [weekOffset, monthOffset, yearOffset]);

  const createChartData = (
    data,
    labels,
    label,
    chartType = "line",
    borderColor = "#fa962f"
  ) => ({
    labels: labels,
    datasets: [
      {
        label: label,
        data: data,
        borderColor: borderColor, // Use the passed borderColor
        backgroundColor: chartType === "line" ? "#fa962f" : "#7c3f00", // Brown for bar chart
        fill: chartType === "line" ? true : false,
        borderWidth: chartType === "line" ? 5 : 3,
      },
    ],
  });

  const formatWeekLabels = (weeklyData) => {
    const revenueByDay = new Array(7).fill(0);

    weeklyData.forEach((item) => {
      const date = new Date(item.date);
      const localDate = new Date(date.toLocaleString());
      let dayOfWeek = localDate.getDay();

      if (dayOfWeek === 6) {
        dayOfWeek = 0; // Saturday becomes 0
      } else {
        dayOfWeek += 1; // Shift Sunday to 1, Monday to 2, ..., Friday to 6
      }

      revenueByDay[dayOfWeek] += item.totalRevenue;
    });

    return revenueByDay;
  };

  const formatMonthlyLabels = (monthlyData) => {
    const daysInMonth = new Date(2024, 11, 0).getDate();
    const revenueByDay = new Array(daysInMonth).fill(0);
    monthlyData.forEach((item) => {
      const dayOfMonth = new Date(item.date).getDate() - 1;
      revenueByDay[dayOfMonth] = item.totalRevenue;
    });
    return revenueByDay;
  };

  const formatYearlyLabels = () => monthsOfYear;

  const formatYearlyData = (yearlyData) => {
    const revenueByMonth = new Array(12).fill(0);
    yearlyData.forEach((item) => {
      const monthIndex = new Date(item.month).getMonth();
      revenueByMonth[monthIndex] = item.totalRevenue;
    });
    return revenueByMonth;
  };

  const handlePreviousWeek = () =>
    setWeekOffset((prevOffset) => prevOffset - 1);
  const handleNextWeek = () => setWeekOffset((prevOffset) => prevOffset + 1);

  const handlePreviousMonth = () =>
    setMonthOffset((prevOffset) => prevOffset - 1);
  const handleNextMonth = () => setMonthOffset((prevOffset) => prevOffset + 1);
  const handlePreviousYear = () =>
    setYearOffset((prevOffset) => prevOffset - 1);
  const handleNextYear = () => setYearOffset((prevOffset) => prevOffset + 1);
  return (
    <div className="container mx-auto p-4 text-[#ded2bb]  grid justify-center items-center">
      {/* Revenue Cards */}
      <div className="flex flex-col lg:flex-row justify-around gap-4">
        {/* Daily Revenue */}
        <div
          className="p-4 bg-white text-black rounded shadow  
        text-center grid items-center justify-center"
        >
          <h2 className="text-2xl lg:text-xl pb-2 flex items-center font-semibold">
            £ Daily Revenue
          </h2>
          <div className="flex lg:flex-col items-center lg:justify-start justify-between gap-2">
            <p className="text-5xl lg:text-4xl text-black font-bold">
              £
              {dailyRevenue
                ?.reduce((sum, { totalRevenue }) => sum + totalRevenue, 0)
                .toFixed(2)}
            </p>
          </div>
          <p className="text-xl text-black">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Weekly Revenue */}
        <div className="p-4 bg-white text-black rounded shadow  text-center grid items-center justify-center">
          <h2 className="text-2xl lg:text-xl pb-2 flex items-center font-semibold">
            <FaChartLine className="mr-2 font-semibold text-black" /> Weekly
            Revenue
          </h2>
          <p className="text-5xl lg:text-4xl text-black font-bold">
            £
            {weeklyRevenue
              ?.reduce((sum, { totalRevenue }) => sum + totalRevenue, 0)
              .toFixed(2)}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousWeek}
              className="bg-[#493116] text-white px-2 py-1 rounded"
            >
              &lt;
            </button>
            <button
              onClick={handleNextWeek}
              className={`bg-[#493116] text-white px-2 py-1 rounded ${
                weekOffset === 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={weekOffset === 0}
            >
              &gt;
            </button>
          </div>
          <p className="text-[#ded2bb]text-xs">{`From ${
            getWeekDateRange(weekOffset).start
          } to ${getWeekDateRange(weekOffset).end}`}</p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 bg-white text-black rounded shadow  text-center">
          <h2 className="text-2xl lg:text-xl pb-2 flex items-center font-semibold">
            <FaCalendarAlt className="mr-2 font-semibold text-black " /> Monthly
            Revenue
          </h2>
          <p className="text-5xl lg:text-4xl text-black  font-bold">
            £
            {monthlyRevenue
              ?.reduce((sum, { totalRevenue }) => sum + totalRevenue, 0)
              .toFixed(2)}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="bg-[#181611] text-white px-2 py-1 rounded"
            >
              &lt;
            </button>
            <button
              onClick={handleNextMonth}
              className={`bg-[#181611] text-white px-2 py-1 rounded ${
                monthOffset === 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={monthOffset === 0}
            >
              &gt;
            </button>
          </div>
          <p className="text-black  text-xl">{getMonthName(monthOffset)}</p>
        </div>

        {/* Yearly Revenue */}
        <div
          className="p-4 bg-white rounded shadow 
       text-center"
        >
          <h2 className="text-2xl lg:text-xl pb-2 flex text-black items-center font-semibold">
            <FaCalendarAlt className="mr-2 font-semibold text-black " /> Yearly
            Revenue
          </h2>
          <p className="text-5xl lg:text-4xl text-black  font-bold">
            £
            {yearlyRevenue
              ?.reduce((sum, { totalRevenue }) => sum + totalRevenue, 0)
              .toFixed(2)}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousYear}
              className="bg-yellow-900 text-white px-2 py-1 rounded"
            >
              &lt;
            </button>
            <button
              onClick={handleNextYear}
              className="bg-yellow-900 text-white px-2 py-1 rounded"
            >
              &gt;
            </button>
          </div>
          <p className="text-black  text-xl">
            {new Date().getFullYear() + yearOffset}
          </p>
          {/* <p className="text-5xl lg:text-4xl text-[#ded2bb]  font-bold">£{yearlyRevenue?.reduce((sum, { totalRevenue }) => sum + totalRevenue, 0).toFixed(2)}</p> */}
        </div>
      </div>

      {/* Charts */}
      <div
        className="mt-8 grid lg:grid-cols-2
     justify-center gap-4"
      >
        {/* Weekly Chart */}
        <div className="w-full bg-white p-5 ">
          <h3 className="text-lg text-black font-bold mb-4">
            Weekly Revenue Graph
          </h3>
          <Line
            data={createChartData(
              formatWeekLabels(weeklyRevenue),
              daysOfWeek,
              "Revenue",
              "line",
              "black"
            )}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: " black", // Change legend text color
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: " black", // Change color of X-axis labels
                  },
                  title: {
                    display: true,
                    text: "Days of the week", // Optional: Add title to X-axis
                    color: "black", // Change color of X-axis title
                  },
                },
                y: {
                  ticks: {
                    color: "black", // Change color of Y-axis labels
                  },
                  title: {
                    display: true,
                    text: "Revenue (£)", // Optional: Add title to Y-axis
                    color: "black", // Change color of Y-axis title
                  },
                },
              },
            }}
          />
        </div>

        {/* Monthly Chart */}
        <div className="w-full bg-white p-5">
          <h3 className="text-lg text-black font-bold mb-4">
            Monthly Revenue Graph
          </h3>
          <Bar
            data={createChartData(
              formatMonthlyLabels(monthlyRevenue),
              Array.from({ length: 31 }, (_, i) => `D ${i + 1}`),
              "Revenue",
              "bar",
              "#3b004c"
            )}
            options={{ responsive: true }}
          />
        </div>

        {/* Yearly Chart */}
        <div className="w-full bg-white p-5">
          <h3 className="text-lg text-black font-bold mb-4">
            Yearly Revenue Graph
          </h3>
          <Line
            data={createChartData(
              formatYearlyData(yearlyRevenue),
              formatYearlyLabels(),
              "Yearly Revenue"
            )}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "black", // Change legend text color
                  },
                },
                title: {
                  display: true,
                  text: "Yearly Revenue Overview",
                  color: "black",
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: " black", // Change color of X-axis labels
                  },
                  title: {
                    display: true,
                    text: "Months of the  Year", // Optional: Add title to X-axis
                    color: "black", // Change color of X-axis title
                  },
                },
                y: {
                  ticks: {
                    color: " black", // Change color of Y-axis labels
                  },
                  title: {
                    display: true,
                    text: "Revenue (£)", // Optional: Add title to Y-axis
                    color: "black", // Change color of Y-axis title
                  },
                },
              },
            }}
          />
        </div>

        {/* Pie Chart */}
        <div className="w-full border-2 border-orange-900 bg-white shadow-2xl p-4">
          <h3 className="text-lg font-bold text-black mb-4">
            Payment Methods comparison
          </h3>

          <Piecharts />
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
