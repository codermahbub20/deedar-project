/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Swal from "sweetalert2";
// import axios from "axios";
import useAuth from "../../Hooks/useAuth";
import { useDispatch } from "react-redux";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripePublicKey);

// Sample delivery charge mapping

const PickupOrderForm = () => {
  const axiosSecrue = useAxiosSecure();

  const { user } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();
  const { items, totalPrice, spiceLevel, orderType } = location.state || {};
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    zipcode: "",
    mobile: "",
    area: "",
    paymentMethod: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [extraCharge, setExtraCharge] = useState(0);
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const navigate = useNavigate();
  // const removeFromCart = (item) =>
  //   dispatch({ type: "REMOVE_FROM_CART", payload: item });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Fetch locations from the backend using Axios
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosSecrue.get("/api/delivery-location");
        setDeliveryLocations(response.data.data); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching locations:", error);
        alert("Failed to fetch locations");
      }
    };

    fetchLocations();
  }, []);

  // Handle area selection and update delivery charge
  const handleAreaChange = (e) => {
    const selectedArea = e.target.value;
    setFormData({ ...formData, area: selectedArea });

    // Find the selected location's price
    const selectedLocation = deliveryLocations.find(
      (loc) => loc.locationName === selectedArea
    );

    // Update extra charge
    setExtraCharge(selectedLocation ? selectedLocation.price : 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent multiple form submissions
    setIsProcessing(true); // Disable button immediately after clicking
    if (formData.paymentMethod === "stripe") {
      setIsProcessing(true);
    } else if (formData.paymentMethod === "cash") {
      await handleOrderSubmission("cash");
    } else {
      // Alert if no payment method is selected
      Swal.fire("Error", "Please select a payment method", "error");
      setIsProcessing(false);
    }
  };

  const generateOrderNumber = () => {
    const currentOrderNumber =
      parseInt(localStorage.getItem("orderNumber")) || 0;
    const newOrderNumber = currentOrderNumber + 1;
    localStorage.setItem("orderNumber", newOrderNumber);
    return newOrderNumber;
  };

  const handleOrderSubmission = async (paymentStatus) => {
    const orderData = {
      orderNumber: generateOrderNumber(),
      email: formData.email,
      address: formData.address,
      mobile: formData.mobile,
      zipcode: formData.zipcode,
      area: formData.area,
      items,
      totalPrice: totalPrice + extraCharge,
      paymentMethod: formData.paymentMethod,
      paymentStatus,
      status: "x",
      spiceLevel,
      orderType,
      chefEmail: "a",
      userEmail: user?.email,
      time: 1,
      extraCharge,
    };

    if (orderData.totalPrice <= 0) {
      Swal.fire("Error", "Your total is £0, no items to pay for.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      await axiosSecrue.post("/api/orders", orderData);
      Swal.fire(
        "Success",
        "Your order has been placed successfully!",
        "success"
      );
      dispatch({ type: "CLEAR_CART" });
      navigate("/menus");
    } catch (error) {
      console.error("Order submission error:", error);
      Swal.fire(
        "Error",
        "Failed to place your order. Please try again.",
        "error"
      );
    } finally {
      setIsProcessing(false); // Re-enable button after process finishes
    }
  };

  return (
    <div className="p-4">
      <form className="max-w-xl p-5 bg-white mx-auto" onSubmit={handleSubmit}>
        {orderType === "online" ? (
          <h2 className="text-2xl font-bold mb-6">Online Order Details</h2>
        ) : (
          <h2 className="text-2xl font-bold mb-6">Pickup Order Details</h2>
        )}

        <div className="flex gap-5">
          <p>Order Type: {orderType}</p>
          <p className="mb-3">
            Total Price: £{(totalPrice + extraCharge).toFixed(2)}
          </p>
        </div>
        {/* Email Field */}
        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        {/* Mobile Number Field */}
        <InputField
          label="Mobile Number"
          type="text"
          name="mobile"
          value={formData.mobile}
          onChange={handleInputChange}
          required
        />

        {/* Address Field */}
        <InputField
          label="Address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />

        {/* Zip Code Field */}
        <InputField
          label="Zip Code"
          type="text"
          name="zipcode"
          value={formData.zipcode}
          onChange={handleInputChange}
          required
        />

        {/* Area Selection for Online Order */}
        {orderType === "online" && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select Delivery Area
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleAreaChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>
                Select Area
              </option>
              {deliveryLocations.map((location) => (
                <option key={location._id} value={location.locationName}>
                  {location.locationName} (+£{location.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Payment Method</label>
          <div className="flex gap-4">
            <RadioButton
              label="Cash Payment"
              name="paymentMethod"
              value="cash"
              checked={formData.paymentMethod === "cash"}
              onChange={handleInputChange}
            />
            <RadioButton
              label="Online Payment"
              name="paymentMethod"
              value="stripe"
              checked={formData.paymentMethod === "stripe"}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {formData.paymentMethod === "stripe" && (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              totalPrice={totalPrice + extraCharge}
              onPaymentSuccess={(paymentMethodId) =>
                handleOrderSubmission("success", paymentMethodId)
              }
            />
          </Elements>
        )}

        {formData.paymentMethod !== "stripe" && (
          <button
            type="submit"
            className={`mt-4 text-white bg-blue-700 hover:bg-blue-800 rounded px-5 py-2.5 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isProcessing || !formData.paymentMethod}
          >
            {isProcessing
              ? "Processing..."
              : formData.paymentMethod === "stripe"
              ? `Pay £${(totalPrice + extraCharge).toFixed(2)}`
              : "Place Order"}
          </button>
        )}
      </form>
    </div>
  );
};

const StripePaymentForm = ({ totalPrice, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleStripeSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error("Stripe error:", error);
      Swal.fire(
        "Error",
        "Failed to process payment. Please try again.",
        "error"
      );
    } else {
      Swal.fire("Success", "Payment processed successfully!", "success");
      onPaymentSuccess(paymentMethod.id);
    }
  };

  return (
    <form>
      <CardElement
        options={{
          style: {
            base: { fontSize: "16px", color: "#424770" },
            invalid: { color: "#9e2146" },
          },
        }}
      />
      <button
        type="submit"
        className="mt-4 text-white bg-green-600 hover:bg-green-700 rounded px-4 py-2"
        disabled={!stripe}
        onClick={handleStripeSubmit}
      >
        Pay £{totalPrice.toFixed(2)}
      </button>
    </form>
  );
};

const InputField = ({ label, ...props }) => (
  <div className="relative z-0 w-full mb-5 group">
    <input
      {...props}
      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      placeholder=" "
    />
    <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
      {label}
    </label>
  </div>
);

const RadioButton = ({ label, ...props }) => (
  <label className="flex items-center">
    <input type="radio" {...props} className="mr-2" />
    {label}
  </label>
);

export default PickupOrderForm;
