// import React from 'react';

const OutOfRangeModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4"> 
            &#128542; Oops!</h2>
            <p className="text-xs">Your location is outside of our delivery range. You can pick up your order directly from our restaurant. Thank you!</p>
            <div className="mt-4 text-center">
                <button onClick={onClose} className="text-blue-500 hover:underline text-xl">Close</button>
            </div>
        </div>
    </div>
);

export default OutOfRangeModal;
