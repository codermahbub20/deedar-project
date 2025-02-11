import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import chef from "../../assets/chef.png";
import { AuthContext } from "../../providers/AuthProviders";
// import { AuthContext } from "../context/AuthProvider";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgba(67,67,55,0.3)] backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-white font-chewy">
          <img src={chef} className="h-10" alt="Logo" />
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-white">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-red-600 transition ${
                  isActive ? "text-red-600 underline decoration-gold" : ""
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/menus"
              className={({ isActive }) =>
                `hover:text-red-600 transition ${
                  isActive ? "text-red-600 underline decoration-gold" : ""
                }`
              }
            >
              Menu
            </NavLink>
          </li>
          {/* <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-black transition ${
                  isActive ? "text-black underline decoration-gold" : ""
                }`
              }
            >
              About Us
            </NavLink>
          </li> */}
          {/* <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-black transition ${
                  isActive ? "text-black underline decoration-gold" : ""
                }`
              }
            >
              Contact
            </NavLink>
          </li> */}

          {/* Conditional Render: Dashboard or Login */}
          {user ? (
            <>
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `hover:text-red-600 transition ${
                      isActive ? "text-red-600 underline decoration-gold" : ""
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <button
                  onClick={logOut}
                  className="hover:text-red-600 transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hover:text-red-600 transition ${
                    isActive ? "text-red-600 underline decoration-gold" : ""
                  }`
                }
              >
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
