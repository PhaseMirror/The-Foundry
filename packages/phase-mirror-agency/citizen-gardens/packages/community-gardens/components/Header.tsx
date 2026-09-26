
import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white transition-transform group-hover:rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2A7 7 0 0 1 11 20z"/><path d="M11 13a4 4 0 1 0-4-4"/><path d="M11 21v-1"/></svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-emerald-950">Citizen<span className="text-emerald-600">Gardens</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium text-stone-600">
          <a href="#impact" className="hover:text-emerald-600 transition-colors">Our Impact</a>
          <a href="#gardens" className="hover:text-emerald-600 transition-colors">Find a Garden</a>
          <a href="#mission" className="hover:text-emerald-600 transition-colors">Mission</a>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 transition-colors">Donate</button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-stone-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 py-4 px-4 flex flex-col gap-4">
          <a href="#impact" className="font-medium text-stone-600" onClick={() => setIsOpen(false)}>Our Impact</a>
          <a href="#gardens" className="font-medium text-stone-600" onClick={() => setIsOpen(false)}>Find a Garden</a>
          <a href="#mission" className="font-medium text-stone-600" onClick={() => setIsOpen(false)}>Mission</a>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-full w-full">Donate</button>
        </div>
      )}
    </nav>
  );
};

export default Header;
