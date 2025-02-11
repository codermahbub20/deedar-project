import { useDispatch } from "react-redux";
import Cart from "../../Component/Cart/Cart";
import MenuBox from "./MenuBox/MenuBox";
import { FaUserLock } from "react-icons/fa6"; // Profile icon
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import useRole from "../../Hooks/useRole";

import cardImage from "../../assets/Card_5Star-768x168.jpg";

import Notifications from "../../DASHBOARD/Admin/Notification/Notifications";
const Home = () => {
  const dispatch = useDispatch();
  // const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Get login status from Redux state
  const isLoggedIn = true; // Change this to true to simulate a logged-in user

  const addToCart = (item) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
  };

  const { user, logOut } = useAuth();
  console.log(user?.role);
  const [role] = useRole();

  const handleLogOut = () => {
    logOut();
  };

  console.log(role);

  return (
    <div className="h-full font-sans w-full grid lg:grid-cols-4 px-4 md:px-8 lg:px-10 py-10 lg:py-20 text-2xl md:text-4xl lg:text-5xl gap-4 items-start">
      <div className="lg:col-span-3 lg:min-w-[50vw] min-w-[40vw] overflow-y-auto">
        <div className="max-w-full lg:max-w-[60vw] mx-auto p-4 text-black bg-[#e8e7e5]">
          <MenuBox addToCart={addToCart} />
        </div>
      </div>
      <div className="grid gap-4 lg:col-span-1 mx-auto sticky top-20">
        {/* Cart */}
        <div className="bg-[#e8e7e5] min-w-[90vw] lg:min-w-[20vw] px-4 pb-4 pt-4 w-full min-h-56 overflow-y-auto">
          <Cart />
        </div>
        {/* notification */}
        {role === "Admin" ? (
          <div className="bg-[#e8e7e5] px-4 pb-4 pt-4 w-full">
            <Notifications />
          </div>
        ) : (
          ""
        )}
        {/* card image */}
        <div className="bg-[#e8e7e5] px-4 pb-4 pt-4 w-full">
          <img src={cardImage}></img>
        </div>
        {/* Conditional Login/Profile */}
        <div className="bg-[#e8e7e5] px-4 pb-4 pt-4 w-full">
          {isLoggedIn ? (
            <div>
              <h3
                className="border border-l-2 pl-2
                         text-xl border-l-red-900 flex gap-2
                          text-black justify-between items-center"
              >
                Profile <FaUserCircle />
              </h3>
              <div className="px-5">
                {user ? (
                  <div className="flex justify-between">
                    <Link
                      to="/dashboard"
                      className="text-lg text-gray-600 underline  hover:text-red-950 hover:underline"
                    >
                      Dashboard
                    </Link>
                    <Link
                      onClick={handleLogOut}
                      className="text-lg text-gray-600 underline hover:text-red-950 hover:underline"
                    >
                      Logout
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-lg text-gray-600 hover:text-red-950 hover:underline"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="border border-l-2 pl-2 text-xl border-l-red-900 flex gap-2 text-black justify-between items-center">
                Login <FaUserLock />
              </h3>
              <div className="px-5">
                <Link
                  to="/signup"
                  className="text-lg text-gray-600 hover:text-red-950 hover:underline"
                >
                  Register Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
