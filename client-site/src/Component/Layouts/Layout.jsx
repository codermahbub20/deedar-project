import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import background from "../../assets/vintage.jpg";
import Navbar from "../Navbar/Navbar";

const Layout = () => {
  return (
    <div>
      <Navbar></Navbar>

      <div
        className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${background})`,
          backgroundAttachment: "fixed",
        }}
      >
        {/* Main content area that takes remaining vertical space */}
        <div className="flex-grow">
          <Outlet />
        </div>
        {/* Sticky Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
