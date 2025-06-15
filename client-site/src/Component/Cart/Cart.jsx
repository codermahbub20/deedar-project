// eslint-disable-next-line no-unused-vars
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { PiTrashSimpleThin } from "react-icons/pi";
import Swal from "sweetalert2";
import { TiShoppingCart } from "react-icons/ti";
import { useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import OutOfRangeModal from "./OutofRangle";
import useAuth from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useRestaurantStatus from "../../Hooks/useRestaurantStatus";

const DELIVERY_CHARGE = 0.0;

const Cart = () => {
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const { items, totalPrice } = useSelector((state) => state);
  const [orderType, setOrderType] = useState("");
  // const [spiceLevel, setSpiceLevel] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isRestaurantOpen } = useRestaurantStatus();
  console.log(items);
  const removeFromCart = (item) =>
    dispatch({ type: "REMOVE_FROM_CART", payload: { key: item.key } });

  const isInRange = true;

  // console.log(items);

  const formattedItems = items.map((item) => ({
    name: item.name,
    price: item.variantPrice || item.price,
    quantity: item.quantity,
    variant: item.variant || null,
    category: item.category,
    spiceName: item.spice,
    spicePrice: item.spicePrice,
    extraItems: item.extraItems || [], // Include extraItems
  }));
  console.log(formattedItems);

  // eslint-disable-next-line no-unused-vars
  const handleOrderCompletion = async (method, status) => {
    const orderData = {
      chefEmail: "mkrefat5@gmail.com",
      userEmail: user?.email || "guest@example.com", // Fallback email for testing
      totalPrice: parseFloat(getTotalPrice().toFixed(2)),
      items: formattedItems,
      paymentStatus: status,
      paymentMethod: method,
      orderType,
      // spiceprice,
      // spiceLevel,
    };
    // console.log("Order data", orderData);
    try {
      await axiosSecure.post("/api/orders", orderData);
      // setShowPaymentForm(false);
      Swal.fire(
        "Order Placed",
        `Your order has been placed with ${
          method === "stripe"
            ? "Stripe"
            : method === "cash"
            ? "Cash on Delivery"
            : "Pick Up"
        }!`,
        "success"
      );
      dispatch({ type: "CLEAR_CART" });
    } catch (error) {
      Swal.fire(
        "Error",
        `There was an issue placing your order. Please try again ${error}.`,
        "error"
      );
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      Swal.fire(
        "Error",
        "You need to log in to add items to your cart or place an order.",
        "error"
      ); // Show login error modal
      return;
    }
    if (!isRestaurantOpen) {
      // If restaurant is closed, show an alert
      Swal.fire({
        icon: "warning",
        title: "Sorry",
        text: "The restaurant is currently closed. Please try again later.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#f44336",
      });
    } else if (isRestaurantOpen == true) {
      if (orderType) {
        navigate("/pickup-order", {
          state: {
            items: formattedItems,
            totalPrice: getTotalPrice(),
            // spiceLevel,
            orderType,
          },
        });
      }
    }
  };
  // console.log("itemssssssss", items);

  const handleOrderTypeChange = (type) => {
    if (totalPrice.toFixed(2) <= 8 && type === "online") {
      Swal.fire({
        icon: "warning",
        title: "Sorry",
        text: `Your total is under £8. Please add £ ${(8 - totalPrice).toFixed(
          2
        )} more to place an online order.`,
        confirmButtonText: "Okay",
        confirmButtonColor: "#f44336",
      });
      setShowModal(false);
    } else {
      if (type === "online" && !isInRange) {
        setShowModal(true);
      } else {
        setOrderType(type);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const calculateTotalPrice = () => {
    return items
      .map((item) => {
        const basePrice = item.variantPrice || item.price || 0; // Default to 0 if undefined

        const spicePrice = item.spicePrice || 0; // Default to 0 if undefined

        // Add the price of extraItems
        const extraItemsPrice = item.extraItems
          ? item.extraItems.reduce(
              (sum, extra) => sum + parseFloat(extra.price || 0),
              0
            )
          : 0;

        // Calculate total price for the item
        const totalPrice =
          (basePrice + spicePrice + extraItemsPrice) *
          (parseFloat(item.quantity) || 1);

        return Number(totalPrice.toFixed(2)); // Ensure consistent formatting
      })
      .reduce((acc, curr) => acc + curr, 0); // Sum up all item prices
  };

  const getTotalPrice = () => {
    return orderType === "online"
      ? parseFloat(calculateTotalPrice()) + DELIVERY_CHARGE
      : parseFloat(calculateTotalPrice());
  };

  return (
    <div className="text-black">
      <h3 className="border border-l-2 pl-2 text-xl border-l-red-900 flex gap-2 text-black justify-between items-center">
        Cart <TiShoppingCart />
      </h3>
      <div className="mt-2 p-2 border min-h-36 border-gray-300">
        <ul className="text-xs ">
          {items.length > 0 ? (
            items.map((item) => (
              <li
                key={item.key}
                className="flex justify-between items-center border-gray-600border-b  py-2 border-2"
              >
                <span className="flex-grow">
                  <button
                    onClick={() =>
                      dispatch({
                        type: "INCREMENT_QUANTITY",
                        payload: { key: item.key }, // Pass key, not id
                      })
                    }
                    className="text-gray-600 text-xs border-2 border-gray-400 p rounded-full px-2"
                  >
                    +
                  </button>
                  <span className="lg:text-[16px] text-xs">
                    {item.name && `${item.name}`}
                  </span>{" "}
                  <span className="lg:text-[10px] text-xs">
                    {item.variant && `(${item.variant})`}
                  </span>{" "}
                  <span className="lg:text-[8px] text-xs">
                    {" "}
                    {item.spice && `(${item.spice})`}
                  </span>
                  {item.quantity > 1 && `(${item.quantity}x)`}
                  {/* Display extra items */}
                  {item.extraItems.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {item.extraItems
                        .map(
                          (extra) =>
                            `${extra?.name || ""} ${
                              extra?.price ? extra?.price.toFixed(2) : ""
                            }`
                        )
                        .join(", ")}
                    </span>
                  )}
                  {/* Display special menu platter items under the category name */}
                  {item.category === "Special Platter" && (
                    <span className="text-sm text-gray-600">
                      {item?.name}(
                      {item?.items?.map((subItem) => subItem?.name).join(", ")})
                    </span>
                  )}
                </span>

                <span className="flex-shrink-0">
                  £
                  {(
                    (item.spice && item.variantPrice
                      ? item.variantPrice + item.spicePrice
                      : item.spicelevel && !item.variantPrice
                      ? item.spiceprice + item.price
                      : !item.spicelevel && item.variantPrice
                      ? item.variantPrice
                      : item.price) * (item.quantity ?? 1)
                  ).toFixed(2)}
                </span>

                {item.quantity > 1 ? (
                  <button
                    onClick={() =>
                      dispatch({
                        type: "DECREMENT_QUANTITY",
                        payload: { key: item.key }, // Pass key, not id
                      })
                    }
                    className="text-gray-600 text-xs border-2 border-gray-400 p rounded-full px-2"
                  >
                    -
                  </button>
                ) : (
                  <button
                    onClick={() => removeFromCart(item)}
                    className="pl-2 hover:text-red-800"
                  >
                    <PiTrashSimpleThin />
                  </button>
                )}
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500">
              Your cart is empty. Please add items to your cart.
            </p>
          )}
        </ul>

        {items.length > 0 && (
          <div>
            <div className="text-end">
              {" "}
              <div className="mt-2 text-lg">
                SubTotal: £
                {parseFloat(
                  items
                    .map((item) => {
                      // Calculate base price
                      const basePrice = item.variantPrice || item.price || 0;

                      // Calculate spice price
                      const spicePrice = item.spicePrice || 0;

                      // Calculate extra items price
                      const extraItemsPrice = item.extraItems
                        ? item.extraItems.reduce(
                            (sum, extra) => sum + parseFloat(extra.price || 0),
                            0
                          )
                        : 0;

                      // Calculate total price for the item
                      const totalPrice =
                        (basePrice + spicePrice + extraItemsPrice) *
                        (parseFloat(item.quantity) || 1);

                      return totalPrice; // Return the total price for the item
                    })
                    .reduce((acc, curr) => acc + curr, 0) // Sum up all item prices
                ).toFixed(2)}
              </div>
              {orderType === "online" && (
                <div className="mt-2 text-lg">
                  {/* Delivery Charge: £{DELIVERY_CHARGE.toFixed(2)} */}
                </div>
              )}
              <div className="mt-2 text-lg">
                Total: £
                {parseFloat(
                  items
                    .map((item) => {
                      // Calculate base price
                      const basePrice = item.variantPrice || item.price || 0;

                      // Calculate spice price
                      const spicePrice = item.spicePrice || 0;

                      // Calculate extra items price
                      const extraItemsPrice = item.extraItems
                        ? item.extraItems.reduce(
                            (sum, extra) => sum + parseFloat(extra.price || 0),
                            0
                          )
                        : 0;

                      // Calculate total price for the item
                      const totalPrice =
                        (basePrice + spicePrice + extraItemsPrice) *
                        (parseFloat(item.quantity) || 1);

                      return totalPrice; // Return the total price for the item
                    })
                    .reduce((acc, curr) => acc + curr, 0) // Sum up all item prices
                ).toFixed(2)}
              </div>
              {getTotalPrice() <= 8 ? (
                <p className="text-xs">
                  Your total is under £8. Please add more to place an online
                  order.
                </p>
              ) : (
                ""
              )}
            </div>

            {/* Order Type Selection */}
            <span className="text-lg text-amber-950 mb-2 text-start ">
              Please choose your order{" "}
            </span>
            <div className=" flex gap-4">
              <label className="text-lg flex items-center text-black">
                <input
                  type="radio"
                  name="orderType"
                  value="online"
                  checked={orderType === "online"}
                  onChange={() => handleOrderTypeChange("online")}
                  className="hidden"
                />
                <span
                  className={`inline-block w-6 h-6 mr-2 border-2 border-gray-500 rounded-sm ${
                    orderType === "online" ? "bg-red-950" : ""
                  }`}
                ></span>
                <span>Delivery</span>
              </label>

              <label className="text-lg flex items-center text-black">
                <input
                  type="radio"
                  name="orderType"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={() => handleOrderTypeChange("pickup")}
                  className="hidden"
                />
                <span
                  className={`inline-block w-6 h-6 mr-2 border-2 border-gray-500 rounded-sm ${
                    orderType === "pickup" ? "bg-red-950" : ""
                  }`}
                ></span>
                <span>Pick Up</span>
              </label>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="text-lg text-gray-600 hover:text-red-950 hover:underline mt-2 disabled:no-underline disabled:text-gray-700"
              disabled={parseFloat(getTotalPrice().toFixed(2)) === 0}
            >
              Place Order
            </button>
          </div>
        )}
      </div>

      {/* Login Error Modal */}

      {/* Out of Range Modal */}
      {showModal && <OutOfRangeModal onClose={closeModal} />}
    </div>
  );
};

export default Cart;
