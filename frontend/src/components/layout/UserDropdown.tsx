import { useState, useRef, useEffect } from 'react';
import type { UserDropdownProps } from '../../types/navigation';

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: UserIcon, href: '#profile' },
    { id: 'orders', label: 'My Orders', icon: OrdersIcon, href: '#orders' },
    { id: 'wishlist', label: 'Wishlist', icon: HeartIcon, href: '#wishlist' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '#settings' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full 
                   hover:bg-slate-100 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 
                          flex items-center justify-center text-white font-semibold text-sm
                          ring-2 ring-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block
                     ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl 
                   border border-slate-100 overflow-hidden z-50
                   transform transition-all duration-200 origin-top-right
                   ${isOpen 
                     ? 'opacity-100 scale-100 translate-y-0' 
                     : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu"
      >
        {/* User Info Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700
                        hover:bg-slate-50 hover:text-indigo-600 transition-colors duration-150"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 py-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout?.();
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600
                      hover:bg-rose-50 transition-colors duration-150"
            role="menuitem"
          >
            <LogoutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}





