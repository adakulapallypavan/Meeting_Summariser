import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <img src="/mainLogo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
      <div className="font-semibold text-xl tracking-tight text-gray-800">
        Carnot <span className="text-kannot-blue">Research</span>
      </div>
    </div>
  );
};

export default Logo;
