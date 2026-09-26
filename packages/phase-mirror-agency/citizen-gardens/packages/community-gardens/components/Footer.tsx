
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2A7 7 0 0 1 11 20z"/></svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Citizen<span className="text-emerald-500">Gardens</span></span>
            </div>
            <p className="max-w-md mb-8 leading-relaxed">
              Cultivating communities through urban farming since 2018. We are a registered non-profit dedicated to food sovereignty and ecological health in our cities.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 hover:text-white transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current opacity-50"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-emerald-500">Find a Garden</a></li>
              <li><a href="#" className="hover:text-emerald-500">Volunteering</a></li>
              <li><a href="#" className="hover:text-emerald-500">Workshops</a></li>
              <li><a href="#" className="hover:text-emerald-500">Donation Info</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-2">
                <span>📍</span>
                <span>123 Harvest Ave, Brooklyn, NY</span>
              </li>
              <li className="flex gap-2">
                <span>📧</span>
                <span>hello@citizengardens.org</span>
              </li>
              <li className="flex gap-2">
                <span>📞</span>
                <span>(555) 012-3456</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2024 Citizen Gardens. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Tax ID: 12-3456789</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
