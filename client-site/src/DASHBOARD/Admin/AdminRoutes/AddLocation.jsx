/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const AddLocation = () => {
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure();

  const fetchLocations = async () => {
    try {
      const response = await axiosSecure.get("/api/delivery-location");
      setLocations(response.data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      alert("Failed to fetch locations");
    }
  };

  // Add location

  // Delete location
  // Add location
  const handleAddLocation = async (e) => {
    e.preventDefault();

    if (!location || !price) {
      alert("Please fill in all fields.");
      return;
    }

    const newLocation = {
      locationName: location,
      price: Number(price),
    };

    try {
      setIsSubmitting(true);
      await axiosSecure.post("/api/delivery-location", newLocation);
      alert("Location added successfully!");
      setLocation("");
      setPrice("");
      fetchLocations(); // Refresh locations
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Failed to add location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete location
  const handleDeleteLocation = async (id) => {
    try {
      await axiosSecure.delete(`/api/delivery-location/${id}`);
      alert("Location deleted successfully!");
      fetchLocations(); // Refresh locations
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location");
    }
  };

  // Update location
  const handleUpdateLocation = async (id) => {
    const updatedPrice = prompt("Enter the new price:");
    if (!updatedPrice) return;

    try {
      await axiosSecure.put(`/api/delivery-location/${id}`, {
        price: Number(updatedPrice),
      });
      alert("Location updated successfully!");
      fetchLocations(); // Refresh locations
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location");
    }
  };

  // Load locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);
  return (
    <div className="bg-slate-100 text-black lg:flex  gap-10 justify-center align-middle items-center grid">
      <div className="">
        {" "}
        <h2 className="text-center text-xl font-medium mb-4">Add Location</h2>
        <form
          onSubmit={handleAddLocation}
          className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg mb-6"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Location Name
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location name"
              className="border rounded p-2 bg-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="border rounded p-2 bg-white w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 text-white rounded ${
              isSubmitting ? "bg-gray-400" : "bg-red-500"
            } cursor-pointer`}
          >
            {isSubmitting ? "Adding..." : "Add Location"}
          </button>
        </form>
      </div>
      <div>
        {" "}
        <h2 className="text-center text-xl font-medium mb-4">All Locations</h2>
        <table className="table-auto w-full bg-white shadow-lg rounded-lg">
          <thead>
            <tr className="bg-red-500 text-white">
              <th className="py-2 px-4">Location</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc._id} className="border-b">
                <td className="py-2 px-4">{loc.locationName}</td>
                <td className="py-2 px-4">
                  £
                  {isNaN(Number(loc.price))
                    ? "0.00"
                    : Number(loc.price).toFixed(2)}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => handleUpdateLocation(loc._id)}
                    className="border-2 border-green-800 px-2 text-black text-xs py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc._id)}
                    className="border-2 border-red-800 px-2 text-red text-xs py-1 rounded "
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddLocation;
