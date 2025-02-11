/* eslint-disable react/prop-types */
const TableRow = ({ order }) => {
  return (
    <>
      {order?.items.map((food, idx) => (
        <tr key={idx} className="font-rancho">
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{food?.name}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{food?.quantity}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{food?.price}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableRow;
