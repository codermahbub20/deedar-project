import { useState } from "react";
import { useForm } from "react-hook-form";
import useMenuData from "../../../Hooks/Menudatea";
import Swal from "sweetalert2";
import AddSpecialmenu from "./AddSpecialmenu";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import "./AddSpecialmenu";

const AddMenuItem = () => {
  const { categories, refetch } = useMenuData();
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit } = useForm();
  const [isSetMenu, setIsSetMenu] = useState(false);
  const [setMenuItems, setSetMenuItems] = useState([
    { name: "", price: "", itemsIncluded: [{ name: "", quantity: "" }] },
  ]);
  const [varieties, setVarieties] = useState([{ name: "", price: "" }]);
  const [spicyLevels, setSpicyLevels] = useState([{ name: "", price: "" }]);
  const [addExtraItem, setAddExtraItem] = useState([{ name: "", price: "" }]);

  const onSubmit = async (data) => {
    const itemData = {
      category: isOtherCategory ? data.customCategory : data.category,
      items: isSetMenu
        ? setMenuItems.map((item) => ({
            name: item.name,
            price: item.price,
            itemsIncluded: item.itemsIncluded,
          }))
        : [
            {
              name: data.itemName,
              description: data?.descrpition,
              price: data.price,
              varieties: varieties.filter(
                (variety) => variety.name && variety.price
              ),
              spicyLevels: spicyLevels.filter(
                (level) => level.name && level.price
              ),
              extraItems: addExtraItem
                .filter((item) => item.name && item.price)
                .map((item) => ({
                  ...item,
                  price: Number(item.price),
                })),
            },
          ],
    };
    console.log("Item dataaaaaa", itemData);
    try {
      await axiosSecure.post(`/api/menu/${itemData.category}/item`, itemData);
      Swal.fire({
        title: "Success!",
        text: "Menu item added successfully!",
        icon: "success",
        confirmButtonText: "Okay",
      });
      refetch();
      // Reset all state
      setVarieties([{ name: "", price: "" }]);
      setSpicyLevels([{ name: "", price: "" }]);
      setAddExtraItem([{ name: "", price: "" }]);
      setIsOtherCategory(false);
      setIsSetMenu(false);
      setSetMenuItems([
        { name: "", price: "", itemsIncluded: [{ name: "", quantity: "" }] },
      ]);
    } catch (error) {
      console.error("Error adding item:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add item. Please try again.",
        icon: "error",
        confirmButtonText: "Okay",
      });
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setIsOtherCategory(selectedCategory === "Others");
    setIsSetMenu(selectedCategory === "Set Meals");
    if (selectedCategory !== "Set Meals") {
      setSetMenuItems([
        { name: "", price: "", itemsIncluded: [{ name: "", quantity: "" }] },
      ]);
    }
  };

  const handleAddIncludedItem = (index) => {
    setSetMenuItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index].itemsIncluded.push({ name: "", quantity: "" });
      return updatedItems;
    });
  };

  const handleSetMenuItemChange = (index, field, value) => {
    setSetMenuItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index][field] = value;
      return updatedItems;
    });
  };

  const handleIncludedItemChange = (itemIndex, includedIndex, field, value) => {
    setSetMenuItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[itemIndex].itemsIncluded[includedIndex][field] = value;
      return updatedItems;
    });
  };

  const handleAddVariety = () => {
    setVarieties((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleVarietyChange = (index, field, value) => {
    setVarieties((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddSpicyLevel = () => {
    setSpicyLevels((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleSpicyLevelChange = (index, field, value) => {
    setSpicyLevels((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddExtraItem = () => {
    setAddExtraItem((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleAddExtraItemChange = (index, field, value) => {
    setAddExtraItem((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  return (
    <div className="lg:flex grid text-black gap-2 justify-center align-middle items-center">
      <AddSpecialmenu />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[40vw] mx-auto p-4 min-h-[700px] bg-orange-100 shadow-lg rounded-lg"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Add Menu Item</h2>

        {/* Category */}
        <div className="mb-4">
          <label className="block font-medium">Select Category</label>
          <select
            {...register("category", { required: true })}
            onChange={handleCategoryChange}
            className="border rounded bg-white w-full"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Custom Category */}
        {isOtherCategory && (
          <div className="mb-4">
            <label className="block font-medium">Custom Category Name</label>
            <input
              type="text"
              {...register("customCategory", { required: true })}
              className="border p-2 w-full bg-white rounded"
            />
          </div>
        )}

        {/* Set Menu or Regular */}
        {isSetMenu ? (
          setMenuItems.map((item, index) => (
            <div
              key={index}
              className="mb-4 border p-4 bg-white rounded shadow"
            >
              <h3 className="font-semibold mb-2">Set Meal Item</h3>
              <input
                type="text"
                placeholder="Item Name"
                value={item.name}
                onChange={(e) =>
                  handleSetMenuItemChange(index, "name", e.target.value)
                }
                className="border p-2 w-full mb-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  handleSetMenuItemChange(index, "price", e.target.value)
                }
                className="border p-2 w-full mb-2 rounded"
              />
              <h4 className="font-medium">Included Items</h4>
              {item.itemsIncluded.map((incItem, i) => (
                <div key={i} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Included Item Name"
                    value={incItem.name}
                    onChange={(e) =>
                      handleIncludedItemChange(index, i, "name", e.target.value)
                    }
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={incItem.quantity}
                    onChange={(e) =>
                      handleIncludedItemChange(
                        index,
                        i,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="border p-2 rounded w-24"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddIncludedItem(index)}
                className="text-sm underline"
              >
                Add Included Item +
              </button>
            </div>
          ))
        ) : (
          <>
            <div className="mb-4">
              <label className="block font-medium">Item Name</label>
              <input
                type="text"
                {...register("itemName", { required: true })}
                className="border p-2 w-full bg-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("price", { required: true })}
                className="border p-2 w-full bg-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Description</label>
              <input
                type="text"
                {...register("descrpition")}
                className="border p-2 w-full bg-white rounded"
              />
            </div>
          </>
        )}

        {/* Varieties */}
        <div className="mb-4">
          <label className="block font-medium">Varieties</label>
          {varieties.map((v, i) => (
            <div key={i} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Variety Name"
                value={v.name}
                onChange={(e) => handleVarietyChange(i, "name", e.target.value)}
                className="border p-2 w-full rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={v.price}
                onChange={(e) =>
                  handleVarietyChange(i, "price", e.target.value)
                }
                className="border p-2 w-24 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddVariety}
            className="text-sm underline"
          >
            Add Variety +
          </button>
        </div>

        {/* Spicy Levels */}
        <div className="mb-4">
          <label className="block font-medium">Spicy Levels</label>
          {spicyLevels.map((s, i) => (
            <div key={i} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Level Name"
                value={s.name}
                onChange={(e) =>
                  handleSpicyLevelChange(i, "name", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={s.price}
                onChange={(e) =>
                  handleSpicyLevelChange(i, "price", e.target.value)
                }
                className="border p-2 w-24 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSpicyLevel}
            className="text-sm underline"
          >
            Add Spicy Level +
          </button>
        </div>

        {/* Extra Items */}
        <div className="mb-6">
          <label className="block font-medium">Extra Items</label>
          {addExtraItem.map((extra, i) => (
            <div key={i} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Extra Item"
                value={extra.name}
                onChange={(e) =>
                  handleAddExtraItemChange(i, "name", e.target.value)
                }
                className="border p-2 w-full rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={extra.price}
                onChange={(e) =>
                  handleAddExtraItemChange(i, "price", e.target.value)
                }
                className="border p-2 w-24 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddExtraItem}
            className="text-sm underline"
          >
            Add Extra Item +
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-orange-500 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition duration-300"
        >
          Submit Menu Item
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;
