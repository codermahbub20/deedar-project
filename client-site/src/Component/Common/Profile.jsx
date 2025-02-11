import { useEffect, useState } from "react";
// import useAuth from "../../hooks/useAuth";
import useRole from "../../Hooks/useRole";
import TimePicker from "react-time-picker";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import Swal from "sweetalert2";
// import axios from "axios";
import useAuth from "../../Hooks/useAuth";
import useRestaurantStatus from "../../Hooks/useRestaurantStatus";
import 'react-time-picker/dist/TimePicker.css';  
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const Profile = () => {
  const axiosSecure = useAxiosSecure();

  const { user } = useAuth();
  const [role] = useRole();
  const { isRestaurantOpen, openingTime, closingTime } = useRestaurantStatus();
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  // For restaurant open/close status and time settings
  console.log(openingTime, closingTime);
  // Set initial value of isOpen to isRestaurantOpen from the hook
  const [isOpen, setIsOpen] = useState(isRestaurantOpen);
  // State for restaurant open/close status and time settings
  // const [isOpen, setIsOpen] = useState(isRestaurantOpen);
  const [NewopeningTime, setOpeningTime] = useState(openingTime || "0:0"); // Default value
  const [NewclosingTime, setClosingTime] = useState(closingTime || "00:00"); // Default value

  useEffect(() => {
    setIsOpen(isRestaurantOpen);
  }, [isRestaurantOpen]);
  const handlePasswordChange = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setMessage("Error: No user is logged in.");
        return;
      }

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update the password
      await updatePassword(currentUser, newPassword);
      Swal.fire({
        title: "Password updated successfully!",
        text: "You clicked the button!",
        icon: "success",
      });
      setMessage("Password updated successfully!");
      setShowModal(false);
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setMessage("Error: Incorrect current password.");
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };
 // Handle open/close toggle

  const handleRestaurantStatusChange = async () => {
    try {
      const response = await axiosSecure.post("/api/restaurant/status", {
          isOpen,
          NewopeningTime,
          NewclosingTime,
        }
      );
      if (response.status === 200) {
        Swal.fire({
          title: "Restaurant status updated successfully!",
          icon: "success",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error updating restaurant status.",
        text: error.message,
        icon: "error",
      });
    }
  };
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="bg-white shadow-lg rounded-2xl w-3/5">
        <img
          alt="profile"
          src="https://wallpapercave.com/wp/wp10784415.jpg"
          className="w-full mb-4 rounded-t-lg h-36"
        />
        <div className="flex flex-col items-center justify-center p-4 -mt-16">
          <a href="#" className="relative block">
            <img
              alt="profile"
              src={user?.photoURL}
              className="mx-auto object-cover rounded-full h-24 w-24 border-2 border-white"
            />
          </a>

          <p className="p-2 px-4 text-xs text-white bg-pink-500 rounded-full">
            {role && role.toUpperCase()}
          </p>
          <p className="mt-2 text-xl font-medium text-gray-800">
            User Id: {user.uid}
          </p>
          <div className="w-full p-2 mt-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
              <p className="flex flex-col">
                Name
                <span className="font-bold text-black">{user.displayName}</span>
              </p>
              <p className="flex flex-col">
                Email
                <span className="font-bold text-black">{user.email}</span>
              </p>

              <div>
                <button
                  className="bg-[#F43F5E] px-7 py-1 rounded-lg text-white cursor-pointer hover:bg-[#af4053]"
                  onClick={() => setShowModal(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 bg-white text-black border rounded mb-4"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handlePasswordChange}
                className="bg-green-500 px-4 py-2 rounded text-white"
              >
                Update Password
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 px-4 py-2 rounded text-white"
              >
                Cancel
              </button>
            </div>
            {message && (
              <p className="mt-4 text-sm text-center text-gray-600">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
      {role === "Admin" && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md w-full text-black">
          <h3 className="text-lg font-semibold">
            Restaurant Hours {NewopeningTime}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm"> Update Opening Time</label>
              <TimePicker
                format="HH:mm"
                value={NewopeningTime}
                onChange={(e) => setOpeningTime(e)}
                className="bg-white text-black border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm"> Update Closing Time</label>
              <TimePicker
                value={NewclosingTime}
                format="HH:mm"
                onChange={(e) => setClosingTime(e)}
                className="bg-white text-black border rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="mr-4">
              {isOpen ? (
                <span className="text-xl font-bold text-green-700">Open</span>
              ) : (
                <span className="text-xl font-bold text-red-700">Close</span>
              )}
            </label>
            <input
              type="checkbox"
              checked={isOpen}
              onChange={() => setIsOpen(!isOpen)}
              className="h-6 w-6 bg-white text-black"
            />
          </div>

          <button
            onClick={handleRestaurantStatusChange}
            className="bg-blue-500 px-6 py-2 mt-4 text-white rounded-lg"
          >
            Update Restaurant Status
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
