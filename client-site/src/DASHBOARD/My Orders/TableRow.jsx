/* eslint-disable react/prop-types */
import { useRef, useCallback } from "react";

const TableRow = ({ order }) => {
  const printRef = useRef();

  console.log("order", order);

  // Utility function to copy styles from parent window
  const copyStyles = useCallback((srcDoc, targetDoc) => {
    Array.from(srcDoc.styleSheets).forEach((styleSheet) => {
      const styleElement = styleSheet.ownerNode.cloneNode(true);
      styleElement.href = styleSheet.href;
      targetDoc.head.appendChild(styleElement);
    });

    // Copy fonts
    Array.from(srcDoc.fonts).forEach((font) => targetDoc.fonts.add(font));
  }, []);

  // Function to handle printing
  const handlePrint = useCallback(
    (food) => {
      try {
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
          throw new Error("Failed to open print window");
        }

        const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Receipt</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                padding: 20px;
                margin: 0;
              }
              h2 {
                text-align: center;
                color: #333;
              }
              .receipt-container {
                border: 1px solid #000;
                padding: 15px;
                width: 250px;
                margin: 0 auto;
                background-color: white;
              }
              .receipt-container p {
                margin: 5px 0;
                line-height: 1.4;
              }
              @media print {
                @page {
                  size: auto;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <h2>Receipt</h2>
              <p><strong>Item:</strong> ${food.name}</p>
              <p><strong>Quantity:</strong> ${food.quantity}</p>
              <p><strong>Price:</strong> £${food.price}</p>
              <p><strong>Date:</strong> ${new Date(
                order.createdAt
              ).toLocaleDateString()}</p>
            </div>

            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Copy styles after document is loaded
        setTimeout(() => {
          copyStyles(window.document, printWindow.document);
        }, 100);
      } catch (error) {
        console.error("Error printing receipt:", error);
        alert("Failed to print receipt. Please check your browser settings.");
      }
    },
    [order.createdAt, copyStyles]
  );

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
            <p className="text-gray-900 whitespace-no-wrap">£{food?.price}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            {/* Print Button */}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              onClick={() => handlePrint(food)}
            >
              Print
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableRow;
