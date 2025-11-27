
import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserMenuProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onOpenAuth, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <button 
        onClick={onOpenAuth}
        className="bg-black text-white px-5 py-2 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] active:shadow-none active:translate-y-[2px] transition-all text-sm"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] transition-all"
      >
        <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full bg-gray-200 border border-black" />
        <span className="font-bold text-sm truncate max-w-[100px] hidden sm:block">{user.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 overflow-hidden">
             <div className="p-4 border-b-2 border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Signed in as</p>
                <p className="font-bold truncate">{user.email}</p>
             </div>
             <button 
                onClick={() => {
                    onLogout();
                    setIsOpen(false);
                }}
                className="w-full text-left p-3 hover:bg-red-50 text-red-600 font-bold text-sm flex items-center gap-2 transition-colors"
             >
                <LogOut size={16} />
                Sign Out
             </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
