import React, { useState } from 'react';
import { X, Mail, Lock, Chrome, Github } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (email === 'info@citizengardens.org' && password === 'password') {
        onLogin({
          name: 'Admin',
          email: email,
          role: 'admin',
          avatar: null
        });
        setIsLoading(false);
        onClose();
      } else if (email && password) {
        onLogin({
          name: email.split('@')[0],
          email: email,
          role: 'user',
          avatar: null
        });
        setIsLoading(false);
        onClose();
      } else {
        setError('Invalid credentials');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'user',
        avatar: null
      });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleGithubLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        name: 'GitHub User',
        email: 'github@user.com',
        role: 'user',
        avatar: null,
        githubConnected: true
      });
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-lg font-medium text-white">Sign in to Citizen Gardens</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-900 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <Chrome size={20} className="text-blue-600" />
              <span>Sign in with Google</span>
            </button>
            <button 
              onClick={handleGithubLogin}
              className="w-full bg-[#24292e] text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#2f363d] transition-colors border border-[#333]"
            >
              <Github size={20} />
              <span>Sign in with GitHub (Connect Repositories)</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1e1e1e] text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        
        <div className="p-4 bg-[#252526] border-t border-[#333] text-center">
          <p className="text-xs text-gray-500">
            By clicking continue, you agree to our <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
