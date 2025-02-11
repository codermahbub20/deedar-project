import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure"; // Adjust path if needed
// import axios from "axios";

const useMenuData = () => {
  const axiosSecure = useAxiosSecure();

  // Updated useQuery hook for TanStack Query v5
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menuData'],
    queryFn: async () => {
      const response = await axiosSecure.get("/api/menu");
      return response.data;
    },
    onSettled: (data) => {
      console.log("Data refetched:", data); // Log data when refetch is settled
    }

  });

  // Generate unique categories from the fetched menu data
  const categories = data ? [...new Set(data.map((menu) => menu.category))] : [];
  // console.log( { data, categories, isLoading,  error },'from menudata');
  // Return the data in the same format as before
  return {
    menuData: data || [], // If no data, return an empty array
    categories,           // Extracted categories
    isLoading, error,  // Loading state from TanStack Query
    // error: error?.response?.data?.message error?.response?.data?.message || "Failed to fetch menu data", // Error handling
    refetch,              // refetch function for manual trigger
  };
};

export default useMenuData;
