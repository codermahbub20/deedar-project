/* eslint-disable react/prop-types */
import { useState } from "react";
import Swal from "sweetalert2";

const CategoryCards = ({
  category,
  items,
  onEditCategory,
  onEdit,
  onDelete,
  editItem,
  handleInputChange,
  handleConfirmUpdate,
  handleCancelEdit,
}) => {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category);

  const handleCategoryUpdate = () => {
    if (newCategoryName.trim() === "") {
      Swal.fire("Error", "Category name cannot be empty.", "error");
      return;
    }
    onEditCategory(category, newCategoryName);
    setIsEditingCategory(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {isEditingCategory ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border bg-white bg-white px-2 py-1"
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleCategoryUpdate}
            >
              Save
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setIsEditingCategory(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-bold">{category}</h2>
        )}
        {!isEditingCategory && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setIsEditingCategory(true)}
          >
            Edit Category
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.name} className="border p-4">
            {editItem && editItem.name === item.name ? (
              <div>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border bg-white p-2 mb-2 w-full"
                />
                <input
                  type="number"
                  value={editItem.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="border  bg-white p-2 mb-2 w-full"
                />
                <button
                  onClick={handleConfirmUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Confirm Update
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p>${item.price}</p>
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded mt-2"
                  onClick={() => onEdit(category, item)}
                >
                  Edit Item
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                  onClick={() => onDelete(category, item.name)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCards;
