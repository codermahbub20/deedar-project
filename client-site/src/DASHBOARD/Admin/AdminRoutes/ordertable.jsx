// import { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import ReactToPrint from 'react-to-print';
// import { FaTrash, FaPrint, FaCheckCircle } from 'react-icons/fa';

// const OrderTable = ({ updateRevenue }) => {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const orderDetailsRef = useRef();

//   useEffect(() => {
//     axios
//       .get('http://localhost:3000/api/orders')
//       .then((response) => setOrders(response.data))
//       .catch((error) => console.error('Error fetching orders:', error));
//   }, []);

//   const handleDelete = (id) => {
//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you want to delete this order?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, delete it!',
//     }).then((result) => {
//       if (result.isConfirmed) {
//         axios
//           .delete(`http://localhost:3000/api/orders/${id}`)
//           .then(() => {
//             setOrders(orders.filter((order) => order._id !== id));
//             Swal.fire('Deleted!', 'Order has been deleted.', 'success');
//             updateRevenue();
//           })
//           .catch((error) => {
//             console.error('Error deleting order:', error);
//             Swal.fire('Error!', 'Failed to delete order.', 'error');
//           });
//       }
//     });
//   };

//   const handleUpdatePaymentStatus = (id) => {
//     axios
//       .patch(`http://localhost:3000/api/orders/${id}/payment-status`, { paymentStatus: 'success' })
//       .then(() => {
//         setOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order._id === id ? { ...order, paymentStatus: 'success' } : order
//           )
//         );
//         Swal.fire('Updated!', 'Payment status has been updated.', 'success');
//         updateRevenue();
//       })
//       .catch((error) => {
//         console.error('Error updating payment status:', error);
//         Swal.fire('Error!', 'Failed to update payment status.', 'error');
//       });
//   };

//   const formatDate = (date) => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(date).toLocaleDateString(undefined, options);
//   };

//   const handleRowClick = (order) => setSelectedOrder(order);

//   return (
//     <div className="overflow-x-auto mt-8">
//       <div className="flex gap-6">
//         {/* Table Section */}
//         <div className="flex-1">
//           <table className="min-w-full bg-white shadow-md rounded-lg">
//             <thead>
//               <tr className="border-b">
//                 <th className="px-4 py-2 text-left">Order Date</th>
//                 <th className="px-4 py-2 text-left">Total</th>
//                 <th className="px-4 py-2 text-left">Payment Status</th>
//                 <th className="px-4 py-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr
//                   key={order._id}
//                   className="border-b cursor-pointer"
//                   onClick={() => handleRowClick(order)}
//                 >
//                   <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
//                   <td className="px-4 py-2">${order.totalPrice?.toFixed(2)}</td>
//                   <td className="px-4 py-2">{order.paymentStatus}</td>
//                   <td className="px-4 py-2 flex space-x-4">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleDelete(order._id);
//                       }}
//                       className="text-black hover:text-red-600"
//                       title="Delete Order"
//                     >
//                       <FaTrash size={18} />
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedOrder(order);
//                       }}
//                       className="text-blue-500 hover:text-blue-600"
//                       title="Print Order"
//                     >
//                       <FaPrint size={18} />
//                     </button>
//                     {order.paymentStatus === 'pending' && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleUpdatePaymentStatus(order._id);
//                         }}
//                         className="text-green-500 hover:text-green-600"
//                         title="Confirm Payment"
//                       >
//                         <FaCheckCircle size={18} />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Print Preview Section */}
//   <div>
//         {selectedOrder && (
//           <div
//             ref={orderDetailsRef}
//             className="flex-1 p-6 bg-white shadow-lg rounded-lg mt-8 md:mt-0"
//           >
//             <h3 className="text-xl font-semibold mb-4">Order Details</h3>
//             <p>
//               <strong>User Email:</strong> {selectedOrder.userEmail}
//             </p>
//             <p>
//               <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
//             </p>
//             <p>
//               <strong>Total Price:</strong> ${selectedOrder.totalPrice?.toFixed(2)}
//             </p>
//             <p>
//               <strong>Payment: </strong>
//               {selectedOrder.paymentStatus === 'success' ? 'Paid' : 'Cash on Delivery'}
//             </p>

//             <h4 className="font-semibold mt-4">Items:</h4>
//             <ul className="list-disc pl-6">
//               {selectedOrder.items.map((item, index) => (
//                 <li key={index}>
//                   <p>
//                     {item.name} - ${item.price?.toFixed(2)} x {item.quantity}
//                   </p>
//                 </li>
//               ))}
//             </ul>

//           </div>
//         )}

// <ReactToPrint
//         trigger={() => (
//           <button className="mt-4 text-amber-950 px-4 py-2 underline rounded-md hover:bg-green-600">
//             Print Order
//           </button>
//         )}
//         content={() => orderDetailsRef.current}
//         documentTitle={`Order_${selectedOrder?._id}`}
//       />
//   </div>

//       </div>
//     </div>
//   );
// };

// export default OrderTable;
