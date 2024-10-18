import React from 'react';
import { Link } from 'react-router-dom';

const LandingPages = () => {
  return (
    <div className="landing-page relative bg-[url('./assets/jawdat.jpg')] bg-cover bg-center bg-no-repeat dark:text-white text-center pb-20 pt-[16rem] px-6 ">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="relative max-w-4xl mx-auto text-white">
        {/* Header Section */}
        <p className="absolute text-[22px] font-bold mb-6">
          Name of Restaurant!
        </p>
        
       
        
        {/* CTA Button */}
        
      </div>
    </div>
  );
};

export default LandingPages;
