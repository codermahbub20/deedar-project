import video from "../../assets/9574814-hd_1920_1080_25fps.mp4";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProviders";
import { useContext } from "react";

const Banner = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Black Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1
          className="text-[90px]
          text-orange-500
          font-chewy"
        >
          DEEDAR Express UK
        </h1>
        <p className="mt-4 text-xl md:text-2xl">
          Discover the Taste of Elegance
        </p>
        <p className="text-xl md:text-2xl">Fine Dining at Its Best</p>

        {/* Button */}
        {user ? (
          <button
            onClick={() => navigate("/menus")}
            className="mt-8 px-6 py-3 text-lg 
        font-semibold border border-orange-400 text-gold
        hover:bg-gold hover:text-black transition"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="mt-8 px-6 py-3 text-lg 
        font-semibold border border-orange-400 text-gold
        hover:bg-gold hover:text-black transition"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
};

export default Banner;
