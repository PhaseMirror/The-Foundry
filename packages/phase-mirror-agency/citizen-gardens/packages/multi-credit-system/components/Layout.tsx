
import React from 'react';
import { Flower, LayoutDashboard, Globe, ShieldCheck, User, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'public' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'public' | 'dashboard' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'public', label: 'Mission Portal', icon: Globe },
    { id: 'dashboard', label: 'My Garden', icon: LayoutDashboard },
    { id: 'admin', label: 'Administration', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Flower className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Citizen <span className="text-emerald-500">Gardens</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'text-emerald-400 border-b-2 border-emerald-400' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div className="h-6 w-px bg-slate-800 mx-2" />
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-100">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left ${
                  activeTab === item.id ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Flower className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold">Citizen Gardens</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                A circulatory system for community recognition and participation. Every action seeds a better future.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-4 uppercase text-xs tracking-widest">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400">Bylaws</a></li>
                <li><a href="#" className="hover:text-emerald-400">ELM Pathway</a></li>
                <li><a href="#" className="hover:text-emerald-400">Whitepaper</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-4 uppercase text-xs tracking-widest">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400">Join a Branch</a></li>
                <li><a href="#" className="hover:text-emerald-400">Discord</a></li>
                <li><a href="#" className="hover:text-emerald-400">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2024 Citizen Gardens Multi-Credit System. All actions logged to the double-entry ledger.
          </div>
        </div>
      </footer>
    </div>
  );
};
