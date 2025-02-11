import headingbg from "../../../assets/vintage.jpg";
import chefsticker from "../../../assets/chef.png";

const Heading = ({
  customStyle,
  overlayOpacity = 0.4,
  headingText = "Deedar Express",
}) => {
  return (
    <div
      className={`relative h-20 w-44 flex items-center justify-center text-white text-2xl ${customStyle}`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${headingbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9, // Adjust opacity of the background image here
        }}
      ></div>
      {/* Black Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "black", opacity: overlayOpacity }}
      ></div>
      {/* Heading Text */}
      <h2 className="font-chewy text-3xl relative z-10">{headingText}</h2>
      {/* Chef Hat Sticker */}
      <img
        src={chefsticker}
        alt="Chef Hat"
        className="absolute top-0 left-0 w-12 opacity-90 h-12" // Adjust size as needed
        style={{
          transform: "translate(-40%, -70%) rotate(-19deg)", // Rotate the hat
        }}
      />
    </div>
  );
};

export default Heading;
