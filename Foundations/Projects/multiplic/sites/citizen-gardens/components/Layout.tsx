import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { HeroScene } from './QuantumScene';
import { AnimatedLogo } from './AnimatedLogo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (!location.hash) {
      window.scrollTo(0, 0);
    } else {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  }, [location.pathname, location.hash]);

  const navLinks = [
    { name: 'Gardens', path: '/gardens', isAnchor: false },
    { name: 'Multiplicity', path: '/multiplicity', isAnchor: false },
    { name: 'Solutions', path: '/solutions', isAnchor: false },
    { name: 'Roadmap', path: '/gardens#roadmap', isAnchor: true },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => (e: React.MouseEvent) => {
    if (link.isAnchor) {
      if (location.pathname === '/' || (link.path.startsWith('/gardens') && location.pathname === '/gardens')) {
        const id = link.path.split('#')[1];
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-citizen-bg text-citizen-text selection:bg-citizen-green selection:text-white font-sans overflow-x-hidden">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroScene />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_90%)]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-citizen-bg/90 backdrop-blur-md border-zinc-800 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <AnimatedLogo />
            <div className="flex flex-col">
                <span className="font-lexend font-bold text-xl tracking-tight text-white leading-none">CITIZEN</span>
                <span className="font-lexend font-bold text-[12px] tracking-[0.38em] text-citizen-green uppercase leading-none mt-1">Gardens</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-zinc-400">
            {navLinks.map((link) => (
              link.isAnchor && location.pathname === (link.path.split('#')[0] || '/') ? (
                <a 
                  key={link.name}
                  href={link.path} 
                  onClick={handleNavClick(link)} 
                  className="hover:text-citizen-green transition-colors uppercase text-xs"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="hover:text-citizen-green transition-colors uppercase text-xs"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-citizen-bg flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                onClick={() => setMenuOpen(false)}
                className="hover:text-citizen-green uppercase"
              >
                {link.name}
              </Link>
            ))}
        </div>
      )}

      <main className="relative z-10">
        {children}
      </main>

      <footer className="bg-transparent py-20 border-t border-zinc-900 text-zinc-500 text-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <a href="/admin" className="flex items-center gap-3 cursor-pointer group mb-4">
                <AnimatedLogo />
                <div className="flex flex-col">
                    <span className="font-lexend font-bold text-xl tracking-tight text-white leading-none">CITIZEN</span>
                    <span className="font-lexend font-bold text-[12px] tracking-[0.38em] text-citizen-green uppercase leading-none mt-1">Gardens</span>
                </div>
              </a>
              <p className="text-zinc-500 leading-relaxed max-w-xs">
                Empowering individuals to maximize their reciprocity in multiplicity.
              </p>
              <p className="text-zinc-600 text-xs mt-4">United States, International</p>
            </div>
            
            <div>
              <h4 className="text-zinc-300 font-medium mb-6 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="hover:text-citizen-green transition-colors">About Us</Link></li>
                <li><Link to="/mission" className="hover:text-citizen-green transition-colors">Mission</Link></li>
                <li><Link to="/philosophy" className="hover:text-citizen-green transition-colors">Philosophy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-300 font-medium mb-6 uppercase tracking-widest text-xs">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-citizen-green transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-citizen-green transition-colors">Members</a></li>
                <li><Link to="/theory" className="hover:text-citizen-green transition-colors">Theory</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-zinc-300 font-medium mb-6 uppercase tracking-widest text-xs">Services</h4>
              <ul className="space-y-4">
                <li><Link to="/consultation" className="hover:text-citizen-green transition-colors">Consultation</Link></li>
                <li><a href="#" className="hover:text-citizen-green transition-colors">Software</a></li>
                <li><a href="#" className="hover:text-citizen-green transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Citizen Gardens. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-citizen-green transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-citizen-green transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-citizen-green transition-colors">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
