// import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../../../public/chef-female.json'; // Replace with the path to your Lottie JSON file

const Loader = () => {
  // Define the options for the Lottie animation
  const defaultOptions = {
    loop: true, // Set to false if you want the animation to stop after one loop
    autoplay: true, // Set to true for autoplay
    animationData: animationData, // The Lottie animation JSON data
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice', // This can be adjusted based on your needs
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#e8e7e5]">
      {/* Render the Lottie animation with Tailwind styles */}
      <Lottie options={defaultOptions} height={200} width={200} />
    </div>
  );
};

export default Loader;
