/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid"; 

const SpecialMenuModal = ({ onClose, subcategories, onAddToCart, priceId }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [totalSubcategoryPrice, setTotalSubcategoryPrice] = useState(0); 
  const dispatch = useDispatch();
console.log(subcategories);
  const handleSelect = (subcategoryName, subcategoryPrice, item) => {
    setSelectedItems((prev) => {
      const currentSelections = prev[subcategoryName] || [];
      
      // Check if the item is already selected
      const itemExists = currentSelections.some((selected) => selected.name === item.name);

      // If item is already selected, remove it (deselect)
      let updatedSelections;
      if (itemExists) {
        updatedSelections = currentSelections.filter((selected) => selected.name !== item.name);
      } 
      // If item is not selected, add it but limit the quantity
      else {
        if (currentSelections.length < (subcategories.find(sub => sub.name === subcategoryName)?.subquantity || 1)) {
          updatedSelections = [...currentSelections, item];
        } else {
          updatedSelections = currentSelections; // Limit reached, don't add more
        }
      }
      
      return { ...prev, [subcategoryName]: updatedSelections };
    });

    // Update total price
    setTotalSubcategoryPrice((prevTotal) => {
      const currentSelections = selectedItems[subcategoryName] || [];
      const itemExists = currentSelections.some((selected) => selected.name === item.name);

      if (itemExists) {
        // Remove the item price if it was deselected
        return prevTotal - subcategoryPrice;
      } else {
        // Add the item price if it was newly selected
        return prevTotal + subcategoryPrice;
      }
    });
  };

  const platter = Object.values(selectedItems).flat(); // Flatten all items into a single array

  const handleSubmit = () => {
    const totalPrice = priceId + totalSubcategoryPrice;
    const platterWithCategory = {
      name: uuidv4(),
      category: "Special Platter", 
      items: platter, 
      price: totalPrice,
    };
  
    onAddToCart(platterWithCategory); 
    dispatch({ type: "REMOVE_FROM_CART", payload: { keys: platterWithCategory.key } });
    onClose();
  };

  return (
    <div className="fixed grid inset-0 bg-black bg-opacity-50 z-[52] justify-center items-center">
      <div className="bg-white pt-8 px-6 rounded-lg shadow-xl w-full max-w-4xl h-[80vh]">
        <h2 className="text-3xl mb-6 text-center font-semibold">Create Your Platter</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-scroll pr-4">
          {subcategories?.map((subcategory) => (
            <div key={subcategory.name} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">{subcategory.name} - £{subcategory.price} </h3>
              <h3 className="text-xs mb-2">You can only select {subcategory.subquantity || 1} dishes under {subcategory.name}</h3>
              <ul>
                {subcategory.dishes.map((item) => (
                  <li key={item.name} className="mb-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        name={subcategory.name}
                        value={item.name}
                        checked={selectedItems[subcategory.name]?.some((selected) => selected.name === item.name) || false}
                        onChange={() => handleSelect(subcategory.name, subcategory.price, item)}
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
          disabled={platter.length === 0}
          className="mt-6 p-3 w-44 text-green-700 text-xl border-2 disabled:bg-slate-600 border-green-950 rounded-lg hover:bg-green-500 hover:text-white transition duration-300"
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
