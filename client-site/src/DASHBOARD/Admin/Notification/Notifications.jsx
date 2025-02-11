import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const SoketbaseURL = import.meta.env.VITE_BASE_URL;
let socket;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Create a new Audio instance for the notification sound
  const notificationSound = new Audio("/notification.mp3"); // Path to your sound file in public folder

  useEffect(() => {
    if (!socket) {
      socket = io(SoketbaseURL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("new-order", (data) => {
      setNotifications((prevNotifications) => {
        if (!prevNotifications.find((notif) => notif._id === data._id)) {
          // Play the notification sound when a new order is received
          notificationSound.play();
          return [...prevNotifications, data];
        }
        return prevNotifications;
      });
    });
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Admin Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-xs">No new notifications</p>
      ) : (
        <ul className="text-xl text-green-700">
          {notifications.map((notif) => (
            <li key={notif._id}>
              <Link
                to={{
                  pathname: "/dashboard/New-Orders",
                  state: { order: notif },
                }}
              >
                {`${notifications.length} New order arrived 🛍️`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
