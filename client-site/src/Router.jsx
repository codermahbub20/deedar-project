import { createBrowserRouter } from "react-router-dom";
import Layout from "./Component/Layouts/Layout";
import Home from "./Pages/Home/Home";
import NotFound from "./Pages/NotFound";
import DashboardLayout from "./Component/Layouts/DashboardLayout";
import AdminProfile from "./DASHBOARD/Admin/AdminRoutes/AdminProfile";
import Addmenu from "./DASHBOARD/Admin/AdminRoutes/Addmenu";
// import AllMenulist from "./DASHBOARD/Admin/AdminRoutes/AllMenulist";
import OrderLlist from "./DASHBOARD/Admin/AdminRoutes/OrderLlist";
import SignUp from "./Component/SignUp/SignUp";
import Login from "./Component/LogIn/LogIn";
import UserList from "./DASHBOARD/Admin/AdminRoutes/UserList";
import PrivateRoute from "./providers/PrivateRoute";
import LandingPage from "./Pages/LandingPage/LandingPage";
import MyOrders from "./DASHBOARD/My Orders/MyOrders";
import AllMenuList from "./DASHBOARD/Admin/AdminRoutes/AllMenulist";
import Profile from "./Component/Common/Profile";
import AdminRoute from "./routes/AdminRoute";

// import Stripelist from "./DASHBOARD/Admin/AdminRoutes/Orders/Stripelist";
import CashOrder from "./DASHBOARD/Admin/AdminRoutes/Orders/CashOrder";
import Stripelist from "./DASHBOARD/Admin/AdminRoutes/Orders/Stripelist";
import PickupOrder from "./DASHBOARD/Admin/AdminRoutes/Orders/PickupOrders";
import AcceptsOrder from "./DASHBOARD/Admin/Notification/AcceptsOrder";
import PreparingOrders from "./DASHBOARD/Admin/Notification/PreparingOrder/PreparingOrders";
import UpcomingOrders from "./DASHBOARD/User/UpcommingOrder";
import PickupOrderForm from "./Component/Cart/PickupOrderForm";
import AddLocation from "./DASHBOARD/Admin/AdminRoutes/AddLocation";
// import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/menus", element: <Home /> },
      { path: "/pickup-order", element: <PickupOrderForm /> },
    ],
  },
  {
    path: "/dashboard",
    element: <PrivateRoute />, // Protect the dashboard route
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout role="admin" />,
        children: [
          {
            path: "",
            element: (
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            ),
          },
          {
            path: "add-menu",
            element: (
              <AdminRoute>
                <Addmenu />
              </AdminRoute>
            ),
          },
          {
            path: "dishes",
            element: (
              <AdminRoute>
                <AllMenuList />
              </AdminRoute>
            ),
          },
          {
            path: "New-Orders",
            element: (
              <AdminRoute>
                <AcceptsOrder />
              </AdminRoute>
            ),
          },
          {
            path: "Preparing-list",
            element: (
              <AdminRoute>
                <PreparingOrders />{" "}
              </AdminRoute>
            ),
          },
          {
            path: "orderList",
            element: (
              <PrivateRoute>
                <AdminRoute>
                  <OrderLlist />
                </AdminRoute>
              </PrivateRoute>
            ),
          },
          {
            path: "user-list",
            element: (
              <AdminRoute>
                <UserList />
              </AdminRoute>
            ),
          },
          {
            path: "add-location",
            element: (
              <AdminRoute>
                <AddLocation />
              </AdminRoute>
            ),
          },
          {
            path: "my-orders",
            element: <MyOrders />,
          },
          { path: "profile", element: <Profile /> },
          { path: "stats", element: <AdminProfile /> },
          { path: "add-menu", element: <Addmenu /> },
          { path: "dishes", element: <AllMenuList /> },
          { path: "upocomming-order", element: <UpcomingOrders /> },

          {
            path: "orderList",
            element: <OrderLlist />, // This will display the order list
            children: [
              { path: "strip-order", element: <Stripelist /> }, // Nested under orderList
              { path: "cash-on-delivery", element: <CashOrder /> }, // Nested under orderList
              { path: "pickup", element: <PickupOrder /> }, // Nested under orderList
            ],
          },
        ],
      },
    ],
  },
  { path: "signup", element: <SignUp /> },
  { path: "login", element: <Login /> },
]);

export default router;
