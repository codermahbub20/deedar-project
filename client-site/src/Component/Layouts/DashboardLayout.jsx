/* eslint-disable react/prop-types */
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import {
  FaUser,
  FaPlus,
  FaHome,
  FaSignOutAlt,
  FaCashRegister,
  FaHistory,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { IoNotificationsOutline } from "react-icons/io5";
import { GrMoney } from "react-icons/gr";
import { RiMenuSearchFill } from "react-icons/ri";
import { ImStatsDots } from "react-icons/im";
import Heading from "../../Pages/Home/MenuBox/Heading";
// import backgroundimg from "../../assets/vintage.jpg";
import { AuthContext } from "../../providers/AuthProviders";
import useRole from "../../Hooks/useRole.js";
import { FaBowlFood } from "react-icons/fa6";

const MenuItem = ({ to, icon, label }) => (
  <li className=" text-white mr-2 hover:underline hover:text-orange-200">
    <NavLink
      to={to}
      className={({ isActive }) =>
        `mt-4 ${
          isActive ? "text-red-300 underline" : "text-white"
        }  flex items-center gap-2 text-xl hover:underline hover:text-orange-200`
      }
    >
      <span> {icon} </span> <span> {label}</span>
    </NavLink>
  </li>
);
const OrderSubMenu = ({ isOpen }) =>
  isOpen && (
    <ul className="pl-6 mt-2 space-y-2">
      <li className="flex items-center gap-2 text-xl mr-2">
        <FaCashRegister />
        <NavLink
          to="orderList/strip-order"
          className={({ isActive }) =>
            `mt-4 ${
              isActive ? "text-red-300 underline" : "text-white"
            }text-xl hover:underline hover:text-orange-200`
          }
        >
          Online
        </NavLink>
      </li>
      <li className="flex items-center gap-2 text-xl mr-2">
        <GrMoney />
        <NavLink
          to="orderList/cash-on-delivery"
          className={({ isActive }) =>
            `mt-4 ${
              isActive ? "text-red-300 underline" : "text-white"
            } hover:underline hover:text-orange-200`
          }
        >
          Cash
        </NavLink>
      </li>
      {/* Uncomment and update as needed for additional submenus */}
    </ul>
  );

const DashboardLayout = () => {
  const { logOut, user } = useContext(AuthContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderSubMenuOpen, setOrderSubMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [role] = useRole(); // Fetch user role dynamically

  const toggleMenu = () => setIsExpanded(!isExpanded);
  const toggleOrderSubMenu = () => setOrderSubMenuOpen(!orderSubMenuOpen);

  const handleLogout = async () => {
    try {
      await logOut();
      console.log("Logout successful");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <div className="lg:flex lg:min-h-screen h-full bg-gray-500">
      {/* Sidebar for large devices */}
      <nav
        // style={{ backgroundImage: `url(${backgroundimg})` }}
        className="lg:fixed lg:flex lg:flex-col lg:min-h-screen 
        justify-start  align-middle items-center pl-4 hidden 
        lg:w-52 h-full bg-cover bg-center relative bg-[#191000]"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="pt-10 z-10 relative hidden ">
          <Heading customStyle="h-12 text-white text-center" />
        </div>
        <ul className="mt-4 z-10 relative space-y-4 overflow-y-auto ">
          <MenuItem to="/" icon={<FaHome />} label="Home" />

          {role === "Admin" && (
            <>
              <MenuItem to="profile" icon={<FaUser />} label="Profile" />
              <MenuItem to="stats" icon={<ImStatsDots />} label="Stats" />
              <MenuItem to="add-menu" icon={<FaPlus />} label="Add Menu" />
              <MenuItem
                to="add-location"
                icon={<CiLocationOn />}
                label="Add Location"
              />
              <MenuItem
                to="New-Orders"
                icon={<IoNotificationsOutline />}
                label="NEW"
              />
              <MenuItem
                to="Preparing-list"
                icon={<FaClock />}
                label="Preparing"
              />
              <MenuItem
                to="dishes"
                icon={<RiMenuSearchFill />}
                label="All Dishes"
              />
              <li>
                <div
                  onClick={toggleOrderSubMenu}
                  className="flex items-center cursor-pointer text-xl mt-4 text-white"
                >
                  <GrMoney className="mr-2" />
                  Orders
                </div>
                <OrderSubMenu isOpen={orderSubMenuOpen} />
              </li>
              <MenuItem to="user-list" icon={<FaUsers />} label="All Users" />
            </>
          )}

          {role === "guest" && (
            <>
              <MenuItem to="profile" icon={<FaUser />} label="Profile" />
              <MenuItem
                to="my-orders"
                icon={<FaHistory />}
                label="Order History"
              />
              <MenuItem
                to="upocomming-order"
                icon={<FaBowlFood />}
                label="My Orders"
              />
            </>
          )}

          {user && (
            <li className="flex items-center">
              <FaSignOutAlt className="text-white mr-2" />
              <button
                onClick={handleLogout}
                className="focus:outline-none text-white"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Navbar for medium and smaller devices */}
      <nav className="lg:hidden bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="text-2xl focus:outline-none"
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
        {isExpanded && (
          <ul className="flex flex-wrap gap-6 mt-4 space-x-4">
            <MenuItem to="/" icon={<FaHome />} label="Home" />
            {role === "Admin" && (
              <>
                <MenuItem to="profile" icon={<FaUser />} label="Profile" />
                <MenuItem to="" icon={<ImStatsDots />} label="Stats" />
                <MenuItem to="add-menu" icon={<FaPlus />} label="Add Menu" />
                <MenuItem
                  to="New-Orders"
                  icon={<IoNotificationsOutline />}
                  label="NEW"
                />
                <MenuItem
                  to="Preparing-list"
                  icon={<FaClock />}
                  label="Countdown"
                />
                <MenuItem
                  to="dishes"
                  icon={<RiMenuSearchFill />}
                  label="All Dishes"
                />
                <li>
                  <div
                    onClick={toggleOrderSubMenu}
                    className="flex items-center cursor-pointer text-xl mt-4 text-white"
                  >
                    <GrMoney className="mr-2" />
                    Orders
                  </div>
                  <OrderSubMenu isOpen={orderSubMenuOpen} />
                </li>
                <MenuItem to="user-list" icon={<FaUsers />} label="All Users" />
              </>
            )}
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center"
                >
                  <FaSignOutAlt />
                  <span className="text-sm">Logout</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-400 text-black lg:ml-48">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {role === "Admin" ? "Admin Dashboard" : "User Profile"}
        </h2>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
