/* eslint-disable no-duplicate-case */
/* eslint-disable no-case-declarations */
const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  totalPrice: 0,
};

// Calculate total price at initialization
if (initialState.items.length > 0) {
  initialState.totalPrice = initialState.items.reduce(
    (total, item) =>
      total +
      ((item.variantPrice || item.price) +
        (item.spiceprice || 0) +
        item.extraItems?.reduce((sum, extra) => sum + extra.price, 0)) *
        (item.quantity || 1),
    0
  );
}

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const {
        name,
        variant,
        spice,
        price,
        variantPrice,
        category,
        items = [], // Main items
        extraItems = [], // Additional items
        spicePrice,
      } = action.payload;
    
      const key = `${name}-${variant || "default"}-${spice || "default"}`;
    
      console.log("Payload for ADD_TO_CART:", action.payload);
    
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.key === key &&
          JSON.stringify(item.extraItems) === JSON.stringify(extraItems) &&
          JSON.stringify(item.items) === JSON.stringify(items)
      );
    
      let updatedItems;
      if (existingItemIndex !== -1) {
        const updatedItem = {
          ...state.items[existingItemIndex],
          quantity: state.items[existingItemIndex].quantity + 1,
          extraItems: [
            ...state.items[existingItemIndex].extraItems,
            ...extraItems,
          ],
          items: [...state.items[existingItemIndex].items, ...items],
        };
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = updatedItem;
      } else {
        const newItem = {
          category,
          key,
          name,
          spice,
          spicePrice,
          spicelevel: spice?.name || null,
          spiceprice: spice?.price || null,
          variant: variant || null,
          price: price + (variantPrice || 0),
          variantPrice: variantPrice || 0,
          items, // Main items
          extraItems, // Additional items
          quantity: 1,
        };
        updatedItems = [...state.items, newItem];
      }
    
      console.log("Updated Items:", updatedItems);
    
      localStorage.setItem("cartItems", JSON.stringify(updatedItems));
    
      return {
        ...state,
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) =>
            total +
            ((item.variantPrice || item.price) +
              (item.spiceprice || 0) +
              (item.items?.reduce((sum, mainItem) => sum + mainItem.price, 0) || 0) +
              (item.extraItems?.reduce((sum, extra) => sum + extra.price, 0) || 0)) *
              item.quantity,
          0
        ),
      };
    }

    case 'REMOVE_FROM_CART': {
      const { key: removeKey } = action.payload;

      const newItems = state.items.filter((item) => item.key !== removeKey);

      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return {
        ...state,
        items: newItems,
        totalPrice: newItems.reduce(
          (total, item) =>
            total +
            ((item.variantPrice || item.price) +
              (item.spiceprice || 0) +
              item.extraItems.reduce((sum, extra) => sum + extra.price, 0)) * // Include extraItems price
              item.quantity,
          0
        ),
      };
    }

    case 'DECREMENT_QUANTITY': {
      const { key } = action.payload;
      const updatedItems = state.items
        .map((item) =>
          item.key === key && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return {
        ...state,
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) =>
            total +
            ((item.variantPrice || item.price) +
              (item.spiceprice || 0) +
              item.extraItems.reduce((sum, extra) => sum + extra.price, 0)) * // Include extraItems price
              item.quantity,
          0
        ),
      };
    }

    case 'INCREMENT_QUANTITY': {
      const { key } = action.payload;
      const updatedItems = state.items.map((item) =>
        item.key === key
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return {
        ...state,
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) =>
            total +
            ((item.variantPrice || item.price) +
              (item.spiceprice || 0) +
              item.extraItems.reduce((sum, extra) => sum + extra.price, 0)) * // Include extraItems price
              item.quantity,
          0
        ),
      };
    }

    case 'CLEAR_CART':
      localStorage.removeItem('cartItems');
      return { ...state, items: [], totalPrice: 0 };

    default:
      return state;
  }
};

export default cartReducer;

// const cartReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case 'ADD_TO_CART':
//       const { name, variant, spice, price, variantPrice, category, items ,spicePrice} = action.payload;
//       const key = variant ? `${name} (${variant})` : name;

//       console.log(action.payload);

//       // Regular items handling
//       const existingItemIndex = state.items.findIndex((item) => item.key === key);

//       let updatedItems;
//       if (existingItemIndex !== -1) {
//         const updatedItem = {
//           ...state.items[existingItemIndex],
//           quantity: state.items[existingItemIndex].quantity + 1,
      
//         };
//         updatedItems = [...state.items];
//         updatedItems[existingItemIndex] = updatedItem;
//       } else {
//         const newItem = {
//           category,
//           items,
//           key,
//           name,
//           spice,
//           spicePrice,
//           spicelevel: spice?.name || null,
//           spiceprice: spice?.price || null,
//           variant: variant || null,
//           price: price + (variantPrice || 0),
//           variantPrice: variantPrice || 0,
//           quantity: 1,
//         };
//         updatedItems = [...state.items, newItem];
//       }
//       console.log(updatedItems, 'hellohere ');
//       localStorage.setItem('cartItems', JSON.stringify(updatedItems));
//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: updatedItems.reduce(
//           (total, item) => total +  ((item.variantPrice || item.price) + (item.spiceprice ||0 ))* item.quantity,
//           0
//         ),
//       };

//     case 'REMOVE_FROM_CART':
//       const { key: removeKey } = action.payload;

//       const newItems = state.items.filter((item) => {

//         return item.key !== removeKey; // For regular items
//       });

//       localStorage.setItem('cartItems', JSON.stringify(newItems));
//       return {
//         ...state,
//         items: newItems,
//         totalPrice: newItems.reduce(
//           (total, item) => total + ((item.variantPrice || item.price) + (item.spiceprice || 0)) * (item.quantity || 1),
//           0
//         ),
//       };
//     case 'DECREMENT_QUANTITY': {
//       const { key } = action.payload; // Use key, not id
//       const updatedItems = state.items
//         .map((item) =>
//           item.key === key && item.quantity > 1
//             ? { ...item, quantity: item.quantity - 1 }
//             : item
//         )
//         .filter((item) => item.quantity > 0); // Remove items with 0 quantity

//       localStorage.setItem('cartItems', JSON.stringify(updatedItems));
//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: updatedItems.reduce(
//           (total, item) => total + ((item.variantPrice || item.price) + (item.spiceprice || 0)) * item.quantity,
//           0
//         ),
//       };
//     }
//     case 'INCREMENT_QUANTITY': {
//       const { key } = action.payload; // Use key, not id
//       const updatedItems = state.items.map((item) =>
//         item.key === key
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       );

//       localStorage.setItem('cartItems', JSON.stringify(updatedItems));
//       return {
//         ...state,
//         items: updatedItems,
//         totalPrice: updatedItems.reduce(
//           (total, item) => total + ((item.variantPrice || item.price) + (item.spiceprice || 0)) * item.quantity,
//           0
//         ),
//       };
//     }


//     case 'CLEAR_CART':
//       localStorage.removeItem('cartItems');
//       return { ...state, items: [], totalPrice: 0 };

//     default:
//       return state;
//   }
// };

// export default cartReducer;