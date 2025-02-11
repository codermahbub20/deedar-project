import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";
import { TbFidgetSpinner } from "react-icons/tb";
import useAuth from "../../Hooks/useAuth";
import { saveUser } from "../../api/aUTH.JS";
import { sendEmailVerification } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

const SignUp = () => {
  const { createUser, signInWithGoogle, updateUserProfile, loading } =
    useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // 1. User Registration
      const result = await createUser(email, password);

      // 2. Save username
      await updateUserProfile(name);

      // 3. Send email verification
      await sendEmailVerification(result.user);
      toast.success("Verification email sent. Please check your inbox.");

      // 4. Save user data in the database
      const dbResponse = await saveUser(result.user);
      console.log(dbResponse);

      // 5. Navigate to login page
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // 1. User Registration
      const result = await signInWithGoogle();

      // 2. Save user data in the database
      const dbResponse = await saveUser(result?.user);
      console.log(dbResponse);

      navigate("/");
      toast.success("SignUp Successful");
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
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
          <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-400">Welcome to DeedarUk</p>
        </div>
        <form
          onSubmit={handleSignUp}
          noValidate=""
          action=""
          className="space-y-6 ng-untouched ng-pristine ng-valid"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter Your Name Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-primary bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
              />
            </div>
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
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-primary bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
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
              className="bg-red-500  w-full rounded-md py-3 text-white"
            >
              {loading ? (
                <TbFidgetSpinner className="animate-spin mx-auto"></TbFidgetSpinner>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center pt-4 space-x-1">
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
          <p className="px-3 text-sm dark:text-gray-400">
            Signup with social accounts
          </p>
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
        </div>
        <div
          onClick={handleGoogleSignIn}
          className="flex justify-center items-center space-x-2 border m-3 p-2 border-gray-300 border-rounded cursor-pointer"
        >
          <FcGoogle size={32} />

          <p>Continue with Google</p>
        </div>
        <p className="px-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="hover:underline hover:text-primary text-gray-600"
          >
            Login
          </Link>
          .
        </p>
      </div>
      <Toaster />
    </div>
  );
};

export default SignUp;
