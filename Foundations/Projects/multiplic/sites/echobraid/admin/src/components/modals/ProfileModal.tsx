import React, { useState, useEffect } from 'react';
import { X, User, Mail, Save, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSave: (user: any) => void;
}

export function ProfileModal({ isOpen, onClose, currentUser, onSave }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      onSave({
        ...currentUser,
        name,
        email,
        bio,
        ...(newPassword ? { passwordChanged: true } : {})
      });
      setIsLoading(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333] sticky top-0 bg-[#1e1e1e] z-10">
          <h2 className="text-lg font-medium text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl text-white font-bold shrink-0">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <button className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline">
                Change Avatar
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JPG, GIF or PNG. Max size of 800K
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[100px] resize-none"
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#333]">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Change Password</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#252526] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-[#333] mt-6">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                <Save size={18} className="mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
