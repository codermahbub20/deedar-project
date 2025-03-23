// import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import Swal from "sweetalert2"; // Import SweetAlert2
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const Specialmenulist = () => {
  const [specialmenulist, setSpecialmenulist] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axiosSecure.get("/api/special-menu");
        setSpecialmenulist(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
  }, []);

  const deleteItem = async (id, subcategoryName, dishName) => {
    const itemType = dishName
      ? "Dish"
      : subcategoryName
      ? "Subcategory"
      : "Category";
    const itemName = dishName || subcategoryName || id;

    const result = await Swal.fire({
      title: `Are you sure you want to delete this ${itemType}?`,
      text: `This will delete the ${itemName} permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      try {
        if (dishName) {
          await axiosSecure.delete(
            `/api/special-menu/${id}/subcategory/${encodeURIComponent(
              subcategoryName
            )}/dish/${encodeURIComponent(dishName)}`
          );
          // Update state to remove dish from specific subcategory
          setSpecialmenulist((prevList) =>
            prevList.map((category) =>
              category.category === id
                ? {
                    ...category,
                    subcategories: category.subcategories.map((subcategory) =>
                      subcategory.name === subcategoryName
                        ? {
                            ...subcategory,
                            dishes: subcategory.dishes.filter(
                              (dish) => dish.name !== dishName
                            ),
                          }
                        : subcategory
                    ),
                  }
                : category
            )
          );
        } else if (subcategoryName) {
          await axiosSecure.delete(
            `/api/special-menu/${id}/subcategory/${encodeURIComponent(
              subcategoryName
            )}`
          );
          // Update state to remove subcategory from the category
          setSpecialmenulist((prevList) =>
            prevList.map((category) =>
              category.category === id
                ? {
                    ...category,
                    subcategories: category.subcategories.filter(
                      (subcategory) => subcategory.name !== subcategoryName
                    ),
                  }
                : category
            )
          );
        } else {
          await axiosSecure.delete(`/api/special-menu/${id}`);
          // Update state to remove the entire category
          setSpecialmenulist((prevList) =>
            prevList.filter((item) => item._id !== id)
          );
        }

        Swal.fire("Deleted!", `${itemType} has been deleted.`, "success");
      } catch (error) {
        console.error("Error deleting item:", error.message);
        Swal.fire("Error!", `There was an issue deleting the item.`, "error");
      }
    } else {
      Swal.fire("Cancelled", "The item was not deleted.", "info");
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex gap-4 text-black flex-wrap max-w-1/2">
          {specialmenulist.map((category, id) => (
            <div key={id}>
              <span className=" flex justify-center align-middle items-center gap-2 ">
                <h3 className=" text-2xl font-bold  underline  pt-10 pb-5">
                  {category.category} - {category.set}{" "}
                </h3>
                <button
                  onClick={() => deleteItem(category._id)}
                  className="text-black text-lg pt-5"
                >
                  <FaTrash />
                </button>
              </span>
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.name}>
                  <span className=" flex justify-start py-6 align-start items-start gap-2 ">
                    <h3 className=" text-xl font-semibold underline  pt-2 ">
                      {subcategory.name} - ${subcategory.price}
                    </h3>
                    <button
                      onClick={() =>
                        deleteItem(category.category, subcategory.name)
                      }
                      className="text-red-900 text-sm pt-5"
                    >
                      <FaTrash />
                    </button>
                  </span>

                  <ul>
                    {subcategory.dishes.map((dish) => (
                      <li className=" flex  text-xs" key={dish.name}>
                        {dish.name}
                        <button
                          onClick={() =>
                            deleteItem(
                              category.category,
                              subcategory.name,
                              dish.name
                            )
                          }
                          className="text-black text-[10px] pl-2 "
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Specialmenulist;
