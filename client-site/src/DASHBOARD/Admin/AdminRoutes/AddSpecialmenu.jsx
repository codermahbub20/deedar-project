import { useForm } from "react-hook-form";
// import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";

const AddSpecialmenu = () => {
  const axiosSecure=useAxiosSecure()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "Mid Week Special Platter",
      Price: 0,
      set: "",
      subcategories: [],
    },
  });
  // const [setOptions, setSetOptions] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [customSet, setCustomSet] = useState(false); // Track if the custom set is selected
  const { data: setOptions, refetch } = useQuery({
    queryKey: ["setOptions"], // Use "queryKey" instead of an array argument
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/api/special-menu/sets"
      );
      return response.data.sets || []; // Return only the required data
    },
  });
  const handleAddSubcategory = () => {
    setSubcategories([
      ...subcategories,
      { name: "", price: 0, subquantity: 0, dishes: [] },
    ]);
  };

  const handleAddItem = (index) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index].dishes.push({ name: "" });
    setSubcategories(updatedSubcategories);
  };

  const onSubmit = async (data) => {
    if (data.Price <= 0) {
      alert("Please fill in a valid price greater than 0.");
      return;
    }
    // If custom set name is provided, override the 'set' field with the custom set value
    if (data.setCustom) {
      data.set = data.setCustom;
    }

    const formattedData = {
      ...data,
      subcategories: subcategories
        .map((subcategory) => {
          if (
            !subcategory.name ||
            !subcategory.subquantity ||
            !subcategory.price ||
            subcategory.price <= 0
          ) {
            alert("Please fill in valid subcategory details.");
            return null;
          }
          return {
            name: subcategory.name,
            price: parseFloat(subcategory.price),
            subquantity: subcategory.subquantity,

            dishes: subcategory.dishes
              .map((dish) => {
                if (!dish.name) {
                  alert("Please fill in the dish name.");
                  return null;
                }
                return { name: dish.name };
              })
              .filter((dish) => dish !== null),
          };
        })
        .filter((subcategory) => subcategory !== null),
    };

    try {
      await axiosSecure.put(
        `/api/special-menu/${encodeURIComponent(
          data.category
        )}`,
        formattedData
      );

      Swal.fire({
        title: "Success!",
        text: "Menu item added successfully!",
        icon: "success",
        confirmButtonText: "Okay",
      });
      refetch();
      reset();
      setSubcategories([]);
    } catch (error) {
      console.error("Error updating menu:", error.message);
      alert("Failed to update menu. Please try again.");
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto w-full bg-gradient-to-r from-green-50 to-green-100 shadow-xl rounded-lg min-h-[700px] overflow-auto">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
        Add Special Menu
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Category selection */}
        <div className="form-control">
          <label className="label text-lg font-medium text-gray-700">
            <span className="label-text">Category</span>
          </label>
          <select
            {...register("category", { required: "Category is required" })}
            className="select select-bordered bg-white text-gray-700 w-full rounded-md focus:ring-2 focus:ring-green-400"
          >
            <option value="Mid Week Special Platter">
              Mid Week Special Platter
            </option>
            <option value="Chef Choice">Chef Choice</option>
          </select>
        </div>

        {/* Set selection */}
        <div className="form-control">
          <label className="label text-lg font-medium text-gray-700">
            <span className="label-text">Set</span>
          </label>
          <select
            {...register("set", { required: "Set is required" })}
            className="select select-bordered bg-white text-gray-700 w-full rounded-md focus:ring-2 focus:ring-green-400"
            onChange={(e) => setCustomSet(e.target.value === "Set custom set")}
          >
            {setOptions?.map((set, index) => (
              <option key={index} value={set}>
                {set}
              </option>
            ))}
            <option value="Set custom set">Set custom set</option>
          </select>
          {customSet && (
            <input
              type="text"
              placeholder="Enter custom set name"
              className="input input-bordered w-full bg-white mt-2 rounded-md focus:ring-2 focus:ring-green-400"
              {...register("setCustom", {
                required: "Custom set name is required",
              })}
            />
          )}
        </div>

        {/* Price field */}
        <div className="form-control">
          <label className="label text-lg font-medium text-gray-700">
            <span className="label-text">Price</span>
          </label>
          <input
            type="number"
            {...register("Price", { required: "Price is required", min: 0 })}
            className="input input-bordered bg-white text-gray-700 w-full rounded-md focus:ring-2 focus:ring-green-400"
            step="0.01"
            min="0"
          />
          {errors.Price && (
            <span className="text-black text-sm">{errors.Price.message}</span>
          )}
        </div>

        {/* Add dynamic subcategories */}
        <div className="mt-6">
          {subcategories.length > 0 && (
            <h3 className="text-xl font-bold text-gray-800">Subcategories</h3>
          )}
          {subcategories.map((subcategory, index) => (
            <div key={index} className="mt-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Subcategory Name"
                  value={subcategory.name}
                  onChange={(e) => {
                    const updatedSubcategories = [...subcategories];
                    updatedSubcategories[index].name = e.target.value;
                    setSubcategories(updatedSubcategories);
                  }}
                  className="input input-bordered w-full bg-white rounded-md focus:ring-2 focus:ring-green-400"
                />
                <div className="flex gap-4">
                  <div>
                    {" "}
                    <label className="label text-lg font-medium text-gray-700">
                      <span className="label-text"> Subcategory Price</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={subcategory.price}
                      onChange={(e) => {
                        const updatedSubcategories = [...subcategories];
                        updatedSubcategories[index] = {
                          ...updatedSubcategories[index],
                          price: Number(e.target.value),
                        };
                        setSubcategories(updatedSubcategories);
                      }}
                      className="input input-bordered w-full bg-white rounded-md focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="label text-lg font-medium text-gray-700">
                      <span className="label-text">Quantity</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Subquantity"
                      value={
                        subcategory.subquantity !== undefined
                          ? subcategory.subquantity
                          : 1
                      }
                      onChange={(e) => {
                        const updatedSubcategories = [...subcategories];
                        updatedSubcategories[index] = {
                          ...updatedSubcategories[index],
                          subquantity: Number(e.target.value),
                        };
                        setSubcategories(updatedSubcategories);
                      }}
                      className="input input-bordered w-full bg-white rounded-md focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {subcategory.dishes.map((dish, dishIndex) => (
                  <div key={dishIndex} className="mt-2">
                    <input
                      type="text"
                      placeholder="Dish Name"
                      value={dish.name}
                      onChange={(e) => {
                        const updatedSubcategories = [...subcategories];
                        updatedSubcategories[index].dishes[dishIndex].name =
                          e.target.value;
                        setSubcategories(updatedSubcategories);
                      }}
                      className="input input-bordered w-full bg-white rounded-md focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAddItem(index)}
                className=" border-2 font-bold border-b-orange-950 mt-2"
              >
                Add Dish
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSubcategory}
            className=" border-2 font-bold border-b-orange-950 mt-2"
          >
            Add Subcategory
          </button>
        </div>

        {/* Submit button */}
        <div className="mt-8">
          <button
            type="submit"
            className="btn btn-primary w-full rounded-md bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-3"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSpecialmenu;