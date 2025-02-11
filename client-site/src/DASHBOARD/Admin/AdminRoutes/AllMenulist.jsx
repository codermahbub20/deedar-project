/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import Swal
import { FaPen, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form"; // Import React Hook Form
import Modal from "react-modal";
import Specialmenulist from "./Specialmenulist";
import useMenuData from "../../../Hooks/Menudatea";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
Modal.setAppElement("#root"); // Accessibility fix
const AllMenuList = () => {
  // const [menu, setMenu] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(2);
  // const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    menuData: menu,
    categories,
    refetch,
    isLoading: loading,
  } = useMenuData();
  // React Hook Form setup
  const { register, handleSubmit, setValue, reset } = useForm();
  console.log(menu);

  const handleDelete = async (category, name) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${name} from the ${category} category.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.delete(
          `/api/menu/${category}/item/${name}`
        );
        if (Array.isArray(menu)) {
          const updatedMenu = menu.map((cat) =>
            cat.category === category
              ? {
                  ...cat,
                  items: cat.items.filter((item) => item.name !== name),
                }
              : cat
          );
        } else {
          console.error("Menu is not an array:", menu);
        }

        Swal.fire("Deleted!", `${name} has been deleted.`, "success");
        refetch();
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire("Error!", "There was an issue deleting the item.", "error");
      }
    }
  };

  const cleanName = (name) => name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const addVariety = () => {
    const newVariety = { name: "", price: 0 };
    const updatedVarieties = [...editingItem.varieties, newVariety];
    setEditingItem({ ...editingItem, varieties: updatedVarieties });
    setValue("varieties", updatedVarieties); // Sync with form state
  };

  const addSpicyLevel = () => {
    const newSpicyLevel = { name: "", price: 0 };
    const updatedSpicyLevels = [...editingItem.spicyLevels, newSpicyLevel];
    setEditingItem({ ...editingItem, spicyLevels: updatedSpicyLevels });
    setValue("spicyLevels", updatedSpicyLevels); // Sync with form state
  };

  const handleVarietyChange = (index, field, value) => {
    const updatedVarieties = [...editingItem.varieties];
    updatedVarieties[index][field] = value;
    setEditingItem({ ...editingItem, varieties: updatedVarieties });
    setValue("varieties", updatedVarieties); // Sync with form state
  };

  const handleSpicyLevelChange = (index, field, value) => {
    console.log(value, "here");
    const updatedSpicyLevels = [...editingItem.spicyLevels];
    updatedSpicyLevels[index][field] = value;
    setEditingItem({ ...editingItem, spicyLevels: updatedSpicyLevels });
    setValue("spicyLevels", updatedSpicyLevels); // Sync with form state
  };

  // Handle update click to enter edit mode
  const handleUpdateClick = (item, category) => {
    item.category = category;
    setEditingItem({
      ...item,
      varieties: item.varieties || [],
      spicyLevels: item.spicyLevels || [],
    });
    setIsModalOpen(true);

    setValue("name", item.name);
    setValue("price", item.price);
    setValue("varieties", item.varieties || []);
    setValue("spicyLevels", item.spicyLevels || []);
    setValue("itemsIncluded", item.itemsIncluded || []);
    setValue("category", category);
  };

  const handleUpdate = async (data) => {
    console.log("Form Data:", data); // Log the form data to check if varieties and spicy levels are updated

    if (!editingItem) {
      console.error("Editing item or category is missing");
      return;
    }

    const updatedItem = {
      ...editingItem,
      name: data.name,
      price: parseFloat(data.price),
      varieties: data.varieties || editingItem.varieties,
      spicyLevels: data.spicyLevels || editingItem.spicyLevels,
      itemsIncluded: data.itemsIncluded || editingItem.itemsIncluded,
    };

    try {
      const response = await axiosSecure.put(
        `/v4/menu/${
          editingItem.category
        }/item/${encodeURIComponent(cleanName(editingItem.name))}`,
        updatedItem
      );
      if (response.status === 200) {
        const updatedMenu = menu.map((cat) =>
          cat.category === editingItem.category
            ? {
                ...cat,
                items: cat.items.map((i) =>
                  i.name === editingItem.name ? { ...i, ...updatedItem } : i
                ),
              }
            : cat
        );

        setIsModalOpen(false);
        Swal.fire("Updated!", `${data.name} has been updated.`, "success");
        refetch();
      }
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire("Error!", "There was an issue updating the item.", "error");
    }
  };

  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const slicedCategories = menu.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(menu.length / categoriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset(); // Clear form values when closing modal
    setEditingItem(null); // Clear editing item state
  };
  const handleDeleteCat = async (id, category) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the category: ${category}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.delete(`/api/menu/category/${id}`);
        const updatedMenu = menu.filter((cat) => cat.category !== category);

        Swal.fire(
          "Deleted!",
          `The category "${category}" has been deleted.`,
          "success"
        );
        refetch();
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire(
          "Error!",
          "There was an issue deleting the category.",
          "error"
        );
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 text-black">
        <div className="container mx-auto py-8 text-black">
          <h2 className="text-center text-4xl font-chewy underline text-white pt-10">
            Regular Menus
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            slicedCategories.map((category, ids) => (
              <div key={ids} className="mb-8">
                <h3 className="font-semibold p-4 text-3xl text-black">
                  {category.category}
                  <button
                    onClick={() =>
                      handleDeleteCat(category._id, category.category)
                    }
                    className="text-black text-xs ml-2"
                  >
                    <FaTrash />
                  </button>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {category.items.map((item, id) => (
                    <div
                      key={id}
                      className="card p-4 border shadow-md rounded-lg bg-white text-black"
                    >
                      <h4 className="text-lg font-bold">{item.name}</h4>
                      <p className="text-sm">
                        Price: {item.price ? item.price.toFixed(2) : 0.0}
                      </p>

                      {item.itemsIncluded.length > 0
                        ? item.itemsIncluded.map((includedItem, idx) => (
                            <p key={idx} className="text-sm">
                              <strong>Items Included:</strong>
                              <span>
                                {includedItem.name} (x{includedItem.quantity}){" "}
                              </span>
                            </p>
                          ))
                        : " "}

                      {item.spicyLevels.length > 0
                        ? item.spicyLevels.map((level, idx) => (
                            <p key={idx} className="text-sm">
                              <strong>Spicy Levels:</strong>
                              <span>
                                <span key={idx}>
                                  {level.name} (+${level.price}){" "}
                                </span>{" "}
                              </span>
                            </p>
                          ))
                        : " "}

                      <p className="text-sm">
                        <strong>Varieties:</strong>
                        {item.varieties.length > 0
                          ? item.varieties.map((variety, idx) => (
                              <span key={idx}>
                                {variety.name} (+${variety.price}){" "}
                              </span>
                            ))
                          : ""}
                      </p>

                      <div className="flex justify-between mt-2">
                        <button
                          onClick={() =>
                            handleUpdateClick(item, category.category)
                          }
                          className="text-black"
                        >
                          <FaPen />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category.category, item.name)
                          }
                          className="text-black"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <Modal
          className="px-5 bg-gray-300 mx-auto w-96 text-black overflow-y-scroll max-h-[80vh]"
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Update Item"
        >
          <h2 className="text-center text-xl font-semibold mb-4">
            Update Item
          </h2>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <label htmlFor="name">Item Name</label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="w-full p-2 border rounded bg-white"
              />
            </div>
            <div>
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                {...register("price")}
                step="0.01"
                min="0"
                className="w-full p-2 border rounded bg-white"
              />
            </div>

            {/* Conditionally render Varieties input fields if varieties array has more than 0 */}
            {editingItem?.varieties?.length > 0 && (
              <div>
                <label htmlFor="varieties">Varieties</label>
                <div className="space-y-2">
                  {editingItem.varieties.map((variety, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Variety Name"
                        value={variety.name}
                        onChange={(e) =>
                          handleVarietyChange(index, "name", e.target.value)
                        } // Use handleVarietyChange here
                        className="w-full p-2 border rounded bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={variety.price}
                        onChange={(e) =>
                          handleVarietyChange(index, "price", e.target.value)
                        } // Use handleVarietyChange here
                        className="w-full p-2 border rounded bg-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariety}
                    className="text-blue-500"
                  >
                    Add Variety
                  </button>
                </div>
              </div>
            )}

            {/* hey gpt please check why i am not getting the newly added or edited   varities and spices data i am not  */}
            {/* Conditionally render Spicy Levels input fields if spicyLevels array has more than 0 */}
            {editingItem?.spicyLevels?.length > 0 && (
              <div>
                <label htmlFor="spicyLevels">Spicy Levels</label>
                <div className="space-y-2">
                  {editingItem.spicyLevels.map((level, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Spicy Level Name"
                        value={level.name}
                        onChange={(e) =>
                          handleSpicyLevelChange(index, "name", e.target.value)
                        } // Use handleSpicyLevelChange here
                        className="w-full p-2 border rounded bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={level.price}
                        onChange={(e) =>
                          handleSpicyLevelChange(index, "price", e.target.value)
                        } // Use handleSpicyLevelChange here
                        className="w-full p-2 border rounded bg-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpicyLevel}
                    className="text-blue-500"
                  >
                    Add Spicy Level
                  </button>
                </div>
              </div>
            )}

            {editingItem?.itemsIncluded?.length > 0 && (
              <div>
                <label htmlFor="itemsIncluded">Items Included</label>
                <input
                  type="text"
                  id="itemsIncluded"
                  {...register("itemsIncluded")}
                  className="w-full p-2 border rounded bg-white"
                />
              </div>
            )}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </Modal>
      </div>
      <hr className="text-black"></hr>
      <div className="bg-orange-200 p-10">
        <h2 className="text-center text-3xl font-chewy underline text-red-950 pt-10">
          Special Platter Menus
        </h2>
        <Specialmenulist></Specialmenulist>
      </div>
    </div>
  );
};

export default AllMenuList;