/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MenuData from "../../../Hooks/Menudatea"; // Ensure this fetches correct menu data
import Loader from "../../../Component/Shared/Loader/Loader";
import Heading from "./Heading";
import { useDispatch } from "react-redux";
// import axios from "axios";
import SpecialMenuModal from "./SpecialMenuModal";
import Swal from "sweetalert2";
import useRestaurantStatus from "../../../Hooks/useRestaurantStatus";
import { MdSignalWifiConnectedNoInternet1 } from "react-icons/md";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import MenuModal from "./MenuMOdal";
const MenuBox = ({ addToCart }) => {
  const axiosSecure = useAxiosSecure();
  const [selectedItem, setSelectedItem] = useState(null);
  const { menuData, isLoading, error, refetch } = MenuData();
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [isAllergiesExpanded, setIsAllergiesExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [specialMenuData, setSpecialMenuData] = useState([]);
  const [specialMenuCat, setSpecialcatMenuData] = useState([]);
  const [isSpecialMenuOpen, setIsSpecialMenuOpen] = useState(false);
  const { isRestaurantOpen, openingTime, closingTime, loadings } =
    useRestaurantStatus();
  const [isStillCantDecideOpen, setIsStillCantDecideOpen] = useState(false);
  const [isSpecialMenuExpanded, setIsSpecialMenuExpanded] = useState(false);
  const [SpecialMenuPriceId, setSpecialMenuPriceId] = useState();
  const [locations, setLocations] = useState([]);
  const [SpecePriceName, setSpicenameandprice] = useState({
    name: "",
    price: 0,
  });
  console.log(SpecePriceName, "ccheck here ");
  // Toggle function for special menu
  const toggleSpecialMenu = () => {
    setIsSpecialMenuExpanded((prev) => !prev);
  };
  const dispatch = useDispatch();
  const toggleCategory = (category) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };
  // Fetch Special Menu
  useEffect(() => {
    const fetchSpecialMenu = async () => {
      try {
        const response = await axiosSecure.get("/api/special-menu"); // Adjust the URL as needed
        setSpecialMenuData(response.data);
      } catch (err) {
        console.error("Failed to fetch special menu:", err);
      }
    };
    fetchSpecialMenu();
  }, []);

  const SpecialMenuprice = specialMenuData.find(
    (item) => item.category === "Chef Choice"
  )?.Price;
  const currentDay = new Date().getDay();
  // const currentDay = 0;
  const handleSpecialMenuClick = (item) => {
    const specialMenu = specialMenuData.find(
      (items) =>
        items.category === "Mid Week Special Platter" && item.set === items.set
    );
    const specialMenuPrice = specialMenu?.Price;
    setSpecialMenuPriceId(specialMenuPrice);
    if (currentDay >= 1 && currentDay <= 4) {
      setSpecialcatMenuData(specialMenu.subcategories || []);
      setIsSpecialMenuOpen(true);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Sorry",
        text: "The Midweek Special Menu is only available from Monday to Thursday.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#f44336",
      });
    }
  };
  const categories = specialMenuData.find(
    (item) => item.category === "Chef Choice"
  );

  const fetchLocations = async () => {
    try {
      // Make the GET request using axios
      const response = await axiosSecure.get("/api/delivery-location");

      // Check if the response contains the expected data
      if (response && response.data) {
        setLocations(response.data.data); // Set the locations if data exists
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      alert(error.message); // You can show a more user-friendly alert message
    }
  };

  // Load locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // const cheCat=categories.category
  const handleStillCantDecideClick = () => {
    // console.log( ,'dehksjfeheuhehfrehfuhehe');
    setSpecialcatMenuData(categories.subcategories);
    setIsStillCantDecideOpen(true);
  };

  console.log(SpecePriceName, "ccheck here ");
  const calculateTotalPrice = (item) => {
    let totalPrice = item.price || 0;

    // Add variant price if available
    if (SpecePriceName && SpecePriceName.price) {
      totalPrice += SpecePriceName.price;
    }

    // Add spice level price if selected
    if (SpecePriceName && SpecePriceName.price) {
      totalPrice += SpecePriceName.price;
    }

    return totalPrice.toFixed(2); // Returning the price in two decimal format
  };

  return (
    <div>
      <div>
        <div className="flex justify-center mb-4 pt-8">
          <Heading />
        </div>
        <p className="text-xs text-center">
          “Serving Homestyle Authentic Indian & Bangladeshi Cuisine”
        </p>
        {loadings ? (
          <p className="text-xl text-center text-green-700">........</p>
        ) : isRestaurantOpen ? (
          <p className="text-xl text-center text-green-700">
            Online orders are available until: {closingTime} (UK Time)
          </p>
        ) : (
          <p className="text-xl text-center text-red-700">
            The restaurant is currently closed. Opening time: {openingTime},
            Closing time: {closingTime}.
          </p>
        )}
      </div>

      <h2 className="text-2xl mb-4 text-center">Menu</h2>

      <div className="">
        <div className="mb-4">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-200 hover:bg-gray-300"
            onClick={() => setIsAllergiesExpanded(!isAllergiesExpanded)}
          >
            <span className="text-xl font-semibold text-red-900 hover:underline">
              ALLERGIES
            </span>
            {isAllergiesExpanded ? (
              <FaChevronUp className="text-xl" />
            ) : (
              <FaChevronDown className="text-xl" />
            )}
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden`}
            style={{ maxHeight: isAllergiesExpanded ? "200px" : "0px" }}
          >
            {isAllergiesExpanded && (
              <p className="text-xs text-center mt-2 px-4 w-full">
                If you have any food allergies or intolerances, please contact
                the takeaway before you place any order. We will try our best to
                accommodate your requirements. However, please be aware we cook
                a variety of menu items that contain allergens. Customers with
                severe allergies and intolerances, please be aware that there
                may be traces of a range of allergens in our food preparation
                areas. 01507 609898.
              </p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-gray-200 hover:bg-gray-300"
            onClick={() => setIsLocationExpanded(!isLocationExpanded)}
          >
            <span className="text-xl font-semibold text-red-900 hover:underline">
              Deliveries
            </span>
            {isAllergiesExpanded ? (
              <FaChevronUp className="text-xl" />
            ) : (
              <FaChevronDown className="text-xl" />
            )}
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden`}
            style={{ minHeight: isLocationExpanded ? "100px" : "0px" }}
          >
            {isLocationExpanded && (
              <ul>
                {locations.map((loc) => (
                  <li key={loc._id} className="border-b text-base">
                    {loc.locationName} ----- £
                    {isNaN(Number(loc.price))
                      ? "0.00"
                      : Number(loc.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center align-middle items-center">
            <Loader />
          </div>
        )}
        {error && (
          <p>
            {" "}
            <span className="text-2xl grid justify-center align-middle items-center text-red-700  ">
              {" "}
              <MdSignalWifiConnectedNoInternet1 />
              internet issue! Please Check you Connection
            </span>{" "}
            <Loader />{" "}
          </p>
        )}

        {/* Special Menu Category */}
        {error ? (
          ""
        ) : (
          <div
            className="flex justify-between items-center cursor-pointer my-2  bg-gray-300  hover:bg-gray-400"
            onClick={toggleSpecialMenu}
          >
            <span className="text-xl font-semibold text-black px-2">
              Mid Week Special Platters
            </span>
            <span className="text-xl text-white flex gap-2">
              <FaChevronDown />
            </span>
          </div>
        )}

        {isSpecialMenuExpanded &&
          (currentDay >= 1 && currentDay <= 4 ? (
            <div
              className="transition-all duration-500 ease-in-out py-10 overflow-hidden"
              style={{
                maxHeight: isSpecialMenuExpanded ? "[full]" : "0px",
              }}
            >
              <ul className="border-b-2 border-dotted pt-2 border-red-900 ">
                {specialMenuData.map(
                  (item, idx) =>
                    item.category === "Mid Week Special Platter" && (
                      <li key={idx}>
                        <div
                          className=" flex justify-between align-middle items-center 
                   pb-2 text-xl cursor-pointer "
                        >
                          <span
                            className=" hover:boder-b-2 hover:border-b hover:border-b-red-950 cursor-pointer "
                            onClick={() => handleSpecialMenuClick(item, idx)}
                          >
                            {item.set ? item.set : "new set"}{" "}
                            <span className="text-xs text-gray-600">
                              (Tuesday, Wednesday & Thursday ONLY)
                            </span>
                          </span>
                          <span
                            className=" hover:boder-b-2 hover:border-b hover:border-b-red-950 cursor-pointer "
                            onClick={() => handleSpecialMenuClick(item, idx)}
                          >
                            £{item.Price}
                          </span>
                        </div>
                        <li className="border-b-2 border-dotted flex flex-col items-start pb-2 text-xl">
                          <ul className="list-disc text-xs text-gray-800 ml-4 mt-2">
                            {item.subcategories.map((item, idx) => (
                              <li key={idx}>
                                {item.subquantity ? (
                                  <span> {item.subquantity}-</span>
                                ) : (
                                  ""
                                )}{" "}
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        </li>
                      </li>
                    )
                )}
              </ul>
            </div>
          ) : (
            <>
              <ul className="border-b-2 pt-2 border-dotted border-red-900 z-20">
                {specialMenuData.map((item, idx) =>
                  item.category === "Mid Week Special Platter" ? (
                    <li key={idx} className="relative overflow-hidden">
                      {/* Rotated Text */}
                      <div
                        className="absolute top-10 left-0 right-0 bottom-0 flex 
        justify-center items-center"
                      >
                        <p
                          className="bg-red-400 text-white text-xs w-full h-8
           text-center transform rotate-[-10deg] absolute top-0 left-0 
           right-0 bottom-0"
                        >
                          Available only from Monday to Thursday!
                        </p>
                      </div>
                      <div className="flex justify-between items-center pb-2 text-xl cursor-pointer hover:underline-offset-2 hover:underline">
                        <span onClick={() => handleSpecialMenuClick(item, idx)}>
                          {item.set ? item.set : "new set"}
                        </span>
                        <span onClick={() => handleSpecialMenuClick(item, idx)}>
                          £{item.Price}
                        </span>
                      </div>
                      <li className="border-b-2 border-dotted flex flex-col items-start pb-2 text-xl relative">
                        <ul className="list-disc text-xs text-gray-800 ml-4 mt-2">
                          {item.subcategories.map((item, idx) => (
                            <li key={idx}> {item.name}</li>
                          ))}
                        </ul>
                      </li>
                    </li>
                  ) : null
                )}
              </ul>
            </>
          ))}

        {/* Render SpecialMenuModal if the special menu is open */}
        {isSpecialMenuOpen && (
          <SpecialMenuModal
            onClose={() => setIsSpecialMenuOpen(false)}
            subcategories={specialMenuCat}
            priceId={SpecialMenuPriceId}
            onAddToCart={(platter) => {
              dispatch({ type: "ADD_TO_CART", payload: platter });
              setIsSpecialMenuOpen(false);
            }}
          />
        )}

        {!isLoading &&
          !error &&
          menuData.map((menu) => (
            <div key={menu.category} className="mb-4">
              <div
                className="flex justify-between items-center cursor-pointer p-2 bg-gray-200 hover:bg-gray-300"
                onClick={() => toggleCategory(menu.category)}
              >
                <span className="text-xl">{menu.category}</span>
                {expandedCategories.includes(menu.category) ? (
                  <FaChevronUp className="text-xl" />
                ) : (
                  <FaChevronDown className="text-xl" />
                )}
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden`}
                style={{
                  maxHeight: expandedCategories.includes(menu.category)
                    ? `${menu.items.length * 60}vh`
                    : "0px",
                }}
              >
                <div className="pl-4 pt-2 ">
                  {menu.items.map((item, index) => (
                    <div key={index} className="mb-2">
                      {menu.category === "Set Meals" ? (
                        <div className="border-b-2 border-dotted border-red-900 pb-2">
                          <div className="flex w-full text-xl justify-between">
                            <span
                              className=" hover:boder-b-2 hover:border-b hover:border-b-red-950 cursor-pointer "
                              onClick={() => addToCart(item)}
                            >
                              {item.name}
                            </span>

                            <button
                              className=" hover:boder-b-2 hover:border-b  hover:border-b-red-950 cursor-pointer "
                              onClick={() => addToCart(item)}
                            >
                              + £{item?.price?.toFixed(2)}
                            </button>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {item.itemsIncluded.length > 0 &&
                              item.itemsIncluded.map((includedItem) => (
                                <ul
                                  className="list-disc text-xs text-gray-800 ml-4 mt-2"
                                  key={includedItem.name}
                                >
                                  <li>
                                    {" "}
                                    {includedItem.name} ({includedItem.quantity}
                                    )
                                  </li>
                                </ul>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-1 text-xl border-b-2 border-dotted py-4 border-red-900">
                          <ul className="text-red-900 font-semibold">
                            <div className="flex w-full justify-between">
                              <span
                                onClick={() => {
                                  const totalPrice = calculateTotalPrice(item);
                                  addToCart({
                                    ...item,
                                    spice: SpecePriceName?.name || null,
                                    totalPrice,
                                  });
                                  refetch();
                                }}
                                className=" hover:boder-b-2 hover:border-b hover:border-b-red-950 cursor-pointer "
                              >
                                {" "}
                                {item.name}
                              </span>
                              {item.varieties.length > 0 && (
                                <div className="text-xs grid justify-end gap-1 text-gray-600 mt-1">
                                  <button
                                    className="hover:underline text-lg"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    + select variety
                                  </button>

                                  {selectedItem && (
                                    <MenuModal
                                      item={selectedItem}
                                      onClose={() => setSelectedItem(null)}
                                      onAddToCart={(item) => {
                                        dispatch({
                                          type: "ADD_TO_CART",
                                          payload: item,
                                        });
                                        refetch();
                                      }}
                                    />
                                  )}
                                </div>
                              )}

                              {item.spicyLevels.length > 0 &&
                                item.varieties.length === 0 && (
                                  <div className="text-xs grid justify-end gap-1 text-gray-600 mt-1">
                                    <select
                                      value={SpecePriceName.name || ""}
                                      className="bg-white text-black w-44"
                                      onChange={(e) => {
                                        const spice = item.spicyLevels.find(
                                          (level) =>
                                            level.name === e.target.value
                                        );
                                        if (spice) {
                                          setSpicenameandprice({
                                            name: spice.name,
                                            price: spice.price,
                                          });
                                        }
                                      }}
                                    >
                                      <option value="">Normal Spice</option>
                                      {item.spicyLevels.map((spicy, idx) => (
                                        <option key={idx} value={spicy.name}>
                                          {spicy.name} - £
                                          {spicy.price.toFixed(2)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                              {item.varieties.length === 0 && (
                                <button
                                  className="hover:underline"
                                  onClick={() => {
                                    const totalPrices =
                                      (SpecePriceName?.price || 0) + item.price;

                                    addToCart({
                                      ...item,
                                      spice: SpecePriceName?.name || null,
                                      spicePrice: SpecePriceName?.price || 0,
                                      price: totalPrices.toFixed(2),
                                    });
                                    refetch();
                                    setSpicenameandprice({
                                      name: "",
                                      price: 0,
                                    });
                                  }}
                                >
                                  + £{item.price.toFixed(2)}
                                </button>
                              )}
                            </div>
                          </ul>
                          <span className=" text-lga text-gray-600">
                            {item.descrpition ? item.descrpition : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        <div></div>
        {error ? (
          ""
        ) : (
          <div
            className="flex justify-between items-center cursor-pointer p-2 bg-red-300 hover:bg-red-400"
            onClick={handleStillCantDecideClick}
          >
            <span className="text-xl font-semibold text-white">
              still cant decide ?
            </span>
            <span className="text-xl text-white flex gap-2">
              £{SpecialMenuprice} <FaChevronDown />
            </span>
          </div>
        )}

        {/* still cant decide  */}

        {isStillCantDecideOpen && (
          <SpecialMenuModal
            onClose={() => setIsStillCantDecideOpen(false)}
            subcategories={specialMenuCat}
            priceId={SpecialMenuprice}
            onAddToCart={(platter) => {
              // Ensure platter is an array and contains items
              if (Array.isArray(platter.items) && platter.items.length <= 2) {
                console.log(platter);
                dispatch({ type: "ADD_TO_CART", payload: platter });
                setIsStillCantDecideOpen(false);
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "Limit Exceeded",
                  text: "You can only select up to two items.",
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MenuBox;
