// src/components/Login.js
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";
import { TbFidgetSpinner } from "react-icons/tb";
import { saveUser } from "../../api/aUTH.JS";
import useAuth from "../../Hooks/useAuth";
import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // Correct import
import { app } from "../../../firebase.config";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const Login = () => {
  const { signIn, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from?.pathname || "/";
  const auth = getAuth(app);

  const [email, setEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const result = await signIn(email, password);

      // Check if user is verified
      if (!result.user.emailVerified) {
        throw new Error(
          "Your email is not verified. Please check your inbox and verify your email before logging in."
        );
      }

      // Save user data in database
      await saveUser(result.user);
      toast.success("Login Successful");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Error during login:", err.message);
      toast.error(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();

      // Save user data in database
      await saveUser(result?.user);
      toast.success("Login Successful");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    try {
      if (!email) {
        toast.error("Please enter your email address.");
        return;
      }

      await sendPasswordResetEmail(auth, email); // Correct usage of sendPasswordResetEmail
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetPassword(false); // Close reset password form
    } catch (error) {
      console.error("Failed to send password reset email: ", error);
      toast.error("Failed to send password reset email: " + error.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage:
          "url(https://i.ibb.co.com/0sBP1b3/banner-bg-two-751df5dc.png)",
      }}
    >
      <div className="flex flex-col max-w-md p-6 rounded-md sm:p-10 bg-gray-100 text-gray-900">
        <div className="mb-8 text-center">
          <h1 className="my-3 text-4xl font-bold">Log In</h1>
          <p className="text-sm text-gray-400">
            Sign in to access your account
          </p>
        </div>
        {showResetPassword ? (
          <div>
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="mb-4 text-sm text-gray-400">
              Enter your email to receive a password reset link.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Your Email Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-200 text-gray-900"
              />
            </div>
            <div className="mt-4">
              <button
                onClick={handlePasswordReset}
                className="bg-secondary w-full rounded-md py-3 text-white"
              >
                Send Password Reset Link
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowResetPassword(false)}
                className="text-sm text-gray-600 hover:text-primary"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="Enter Your Email Here"
                  className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    placeholder="*******"
                    className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-200 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="bg-red-500 w-full rounded-md py-3 text-white"
              >
                {loading ? (
                  <TbFidgetSpinner className="animate-spin mx-auto" />
                ) : (
                  "Continue"
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <button
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-gray-600 hover:text-primary"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}
        <div
          onClick={handleGoogleSignIn}
          className="flex justify-center items-center space-x-2 border m-3 p-2 border-gray-300 rounded cursor-pointer"
        >
          <FcGoogle size={32} />
          <p>Continue with Google</p>
        </div>
        <p className="px-6 text-sm text-center text-gray-400">
          Don&apos;t have an account yet?{" "}
          <Link
            to="/signup"
            className="hover:underline hover:text-primary text-gray-600"
          >
            Sign up
          </Link>
        </p>
      </div>
      <Toaster />
    </div>
  );
};

export default Login;
