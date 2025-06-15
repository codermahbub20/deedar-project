/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";

const MenuModal = ({ item, onClose }) => {
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState(null);
  const [addExtraItem, setAddExtraItem] = useState([]);
  const dispatch = useDispatch();

  // const calculateTotalPrice = () => {
  //   let totalPrice = item.price || 0;

  //   // Add variety price if selected
  //   if (selectedVariety) totalPrice += selectedVariety.price || 0;

  //   // Add spice level price if selected
  //   if (selectedSpicyLevel) totalPrice += selectedSpicyLevel.price || 0;

  //   // Add extra items prices if available
  //   if (addExtraItem && addExtraItem.length > 0) {
  //     addExtraItem.forEach((extra) => {
  //       totalPrice += extra.price || 0;
  //     });
  //   }

  //   return Number(totalPrice.toFixed(2)); // Ensure the price is returned as a number with two decimal places
  // };


  const calculateTotalPrice = () => {
    let totalPrice = item.price || 0;
  
    if (selectedVariety) totalPrice += selectedVariety.price || 0;
    if (selectedSpicyLevel) totalPrice += selectedSpicyLevel.price || 0;
  
    if (addExtraItem && Object.keys(addExtraItem).length > 0) {
      Object.values(addExtraItem).forEach((extra) => {
        totalPrice += extra.price || 0;
      });
    }
  
    return Number(totalPrice.toFixed(2));
  };
  

  // const handleExtraItemsChange = (extraItem) => {
  //   const exists = addExtraItem.find((item) => item.name === extraItem.name);

  //   if (exists) {
  //     // Remove the extra item if it is already selected
  //     setAddExtraItem(
  //       addExtraItem.filter((item) => item.name !== extraItem.name)
  //     );
  //   } else {
  //     // Add the extra item
  //     setAddExtraItem([
  //       ...addExtraItem,
  //       { ...extraItem, price: parseFloat(extraItem.price) },
  //     ]);
  //   }
  // };

  const handleExtraItemsChange = (itemId, extraItem) => {
    setAddExtraItem((prev) => ({
      ...prev,
      [itemId]: { ...extraItem, price: parseFloat(extraItem.price) },
    }));
  };
  

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();

    const updatedItem = {
      ...item,
      variant: selectedVariety?.name || null,
      variantPrice: selectedVariety?.price || 0,
      spice: selectedSpicyLevel?.name || null,
      spicePrice: selectedSpicyLevel?.price || 0,
      extraItems: Object.values(addExtraItem).map((extra) => ({
        name: extra.name,
        price: parseFloat(extra.price),
      })),
      totalPrice,
    };

    dispatch({ type: "ADD_TO_CART", payload: updatedItem });
    onClose();
  };

  const handleVarietyChange = (variety) => setSelectedVariety(variety);
  const handleSpicyLevelChange = (level) => setSelectedSpicyLevel(level);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 w-11/12 max-w-md">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="font-bold text-red-950 text-2xl">{item.name}</h2>
          <button onClick={onClose}>
            <FaTimes className="text-red-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Variety Selection */}
          {item.varieties?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-orange-700 text-lg">
                Select Varieties:
              </h3>
              {item.varieties.map((variety, idx) => (
                <label key={idx} className="block">
                  <input
                    type="radio"
                    name={`variety-${item.id}`}
                    checked={selectedVariety?.name === variety.name}
                    onChange={() => handleVarietyChange(variety)}
                    className="mr-2"
                  />
                  {variety.name} - £{parseFloat(variety.price).toFixed(2)}
                </label>
              ))}
            </div>
          )}

          {/* Spice Level Selection */}
          {item.spicyLevels?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-red-900 text-xl">
                Select Spice Level:
              </h3>
              {item.spicyLevels.map((level, idx) => (
                <label key={idx} className="block">
                  <input
                    type="radio"
                    name={`spice-${item.id}`}
                    checked={selectedSpicyLevel?.name === level.name}
                    onChange={() => handleSpicyLevelChange(level)}
                    className="mr-2"
                  />
                  {level.name} - £{parseFloat(level.price).toFixed(2)}
                </label>
              ))}
            </div>
          )}

          {/* Extra Items Selection */}
          {item?.extraItems?.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-green-900 text-xl">
                Select Extra Items:
              </h3>
              {item.extraItems.map((extra, idx) => (
  <label key={idx} className="block">
    <input
      type="radio"
      name={`extra-${item.id}`} // Ensures only one radio is selected per item
      checked={addExtraItem[item.id]?.name === extra.name}
      onChange={() => handleExtraItemsChange(item.id, extra)}
      className="mr-2"
    />
    {extra.name} - £{parseFloat(extra.price).toFixed(2)}
  </label>
))}

            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="font-bold">Total: £{calculateTotalPrice()}</span>
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
