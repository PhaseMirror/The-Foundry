import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="pt-32 pb-20 container mx-auto px-8 text-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to ΞchoBraid</h1>
      <p className="text-xl mb-10 max-w-2xl mx-auto">
        Empowering the next generation of creators and thinkers.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/curriculum" className="px-6 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
          Explore Curriculum
        </Link>
        <Link to="/about_us" className="px-6 py-3 border border-stone-300 rounded-lg font-semibold hover:bg-stone-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800">
          About Us
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
