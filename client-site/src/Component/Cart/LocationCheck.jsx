/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const YourLOCATION = { lat: 24.9048, lng: 91.86 };
// const YourLOCATION = { lat: 52.4800, lng: -1.9025 };

const LocationCheck = ({ onLocationCheck }) => {
  const [isInRange, setIsInRange] = useState(false);
  const [error, setError] = useState(null);

  const checkLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(
            latitude,
            longitude,
            YourLOCATION.lat,
            YourLOCATION.lng
          );
          const inRange = distance <= 9; // 4 km range
          setIsInRange(inRange);
          setError(null); // Clear any previous error
          onLocationCheck(inRange);
        },
        (err) => {
          setError(
            "Unable to retrieve location. Please allow your location to be tracked."
          );
          onLocationCheck(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      onLocationCheck(false);
    }
  };

  useEffect(() => {
    checkLocation();
  }, [onLocationCheck]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  return (
    <div>
      {error ? (
        <p className="text-xs text-red-800">{error}</p>
      ) : (
        <div>
          {isInRange ? (
            <p className="text-xs text-green-800"></p>
          ) : (
            <p className="text-xs text-red-800">
              {" "}
              you are out of our online delivery range{" "}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationCheck;
