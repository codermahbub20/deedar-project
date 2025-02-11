/* eslint-disable react/prop-types */
// PaymentForm.js

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import axios from "axios";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const PaymentForm = ({ totalPrice, handleOrderCompletion }) => {
  const axiosSecure = useAxiosSecure();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { data } = await axiosSecure.post(
      `/api/create-payment-intent`,
      { totalPrice }
    );
    const clientSecret = data.clientSecret;

    const cardElement = elements.getElement(CardElement);

    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (paymentResult.error) {
      setError(paymentResult.error.message);
    } else if (paymentResult.paymentIntent.status === "succeeded") {
      handleOrderCompletion("stripe", "success");
      // handleOrderCompletion(paymentResult.paymentIntent );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <div className=" grid justify-center align-middle gap-2">
        <button
          type="submit"
          disabled={!stripe}
          className="mt-4  text-lg w-44 text-amber-950 border-2 px-6 border-rose-950"
        >
          Pay
        </button>
        {error && <div className="text-black mt-2 text-xs">{error}</div>}
      </div>
    </form>
  );
};

export default PaymentForm;
