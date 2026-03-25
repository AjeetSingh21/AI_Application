import React from 'react';

const Navbar = ({ title }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 fixed top-0 left-64 right-0 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
