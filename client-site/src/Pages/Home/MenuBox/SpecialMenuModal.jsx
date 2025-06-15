/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

const SpecialMenuModal = ({
  onClose,
  subcategories,
  onAddToCart,
  priceId,
  set,
}) => {
  const [selectedItems, setSelectedItems] = useState({});
  const dispatch = useDispatch();
  const hasProcessedAutoAdd = useState(false);

  useEffect(() => {
    if (
      !hasProcessedAutoAdd[0] &&
      (!subcategories ||
        subcategories.length === 0 ||
        subcategories.every((sub) => !sub.dishes || sub.dishes.length === 0))
    ) {
      hasProcessedAutoAdd[0] = true;
      const totalPrice = priceId;
      const platterWithCategory = {
        name: "Special Platter",
        category: "Special Platter",
        items: [],
        price: totalPrice,
      };
      onAddToCart(platterWithCategory);
      onClose();
    }
  }, [subcategories, onAddToCart, priceId, onClose]);

  const handleSelect = (subcategoryName, item, subquantity) => {
    setSelectedItems((prev) => {
      const currentSelections = prev[subcategoryName] || [];
      const itemExists = currentSelections.some(
        (selected) => selected.name === item.name
      );

      let updatedSelections;

      if (itemExists) {
        updatedSelections = currentSelections.filter(
          (selected) => selected.name !== item.name
        );
      } else {
        if (currentSelections.length >= subquantity) {
          Swal.fire({
            icon: "warning",
            title: "Limit Exceeded",
            text: `You can only select up to ${subquantity} items from this category.`,
          });
          return prev;
        }
        updatedSelections = [...currentSelections, item];
      }

      const updatedState = { ...prev, [subcategoryName]: updatedSelections };
      console.log("Updated Selected Items:", updatedState); // Debugging log
      return updatedState;
    });
  };

  const handleSubmit = () => {
    console.log("Selected Items:", selectedItems); // Debugging log

    const platter = Object.values(selectedItems).flat();
    const platterKey = `special-${set}-${Date.now()}`;

    const platterWithCategory = {
      key: platterKey,
      name: `${set !== undefined ? set : "Still can't decide platter"} platter`,
      category: "Special Platter",
      items: platter,
      price: priceId,
    };

    console.log("Platter to Add:", platterWithCategory); // Debugging log

    dispatch({
      type: "ADD_TO_CART",
      payload: platterWithCategory,
    });

    onClose();
  };

  return (
    <div className="fixed grid inset-0 bg-black bg-opacity-50 z-[52] justify-center items-center">
      <div className="bg-white pt-8 px-6 rounded-lg shadow-xl w-full max-w-4xl h-[80vh]">
        <h2 className="text-3xl mb-6 text-center font-semibold">
          Create Your Platter
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-scroll pr-4">
          {subcategories?.map((subcategory) => (
            <div key={subcategory.name} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">{subcategory.name}</h3>
              <h3 className="text-xs mb-2">
                (Optional, Max {subcategory.subquantity} items)
              </h3>
              <ul>
                {subcategory.dishes.map((item) => (
                  <li key={item.name} className="mb-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        name={subcategory.name}
                        value={item.name}
                        checked={
                          selectedItems[subcategory.name]?.some(
                            (selected) => selected.name === item.name
                          ) || false
                        }
                        onChange={() =>
                          handleSelect(
                            subcategory.name,
                            item,
                            subcategory.subquantity
                          )
                        }
                        className="mr-3"
                      />
                      <span>{item.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2 sticky pb-4 bg-white px-6 max-w-4xl w-full">
        <button
          onClick={handleSubmit}
          className="mt-6 p-3 w-44 text-green-700 text-xl border-2 border-green-950 rounded-lg hover:bg-green-500 hover:text-white transition duration-300"
        >
          Add to Cart
        </button>
        <button
          onClick={onClose}
          className="mt-6 p-3 w-44 text-green-700 text-xl border-2 border-green-950 rounded-lg hover:bg-green-500 hover:text-white transition duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SpecialMenuModal;
