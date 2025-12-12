import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { MobileMenuProps } from '../../types/navigation';

export function MobileMenu({ isOpen, onClose, navItems, user, onLogout }: MobileMenuProps) {
  const location = useLocation();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden
                   transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white dark:bg-slate-900 z-50 lg:hidden
                   shadow-2xl transform transition-transform duration-300 ease-out
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-lg font-bold text-slate-900 dark:text-white">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200
                      hover:bg-slate-100 dark:hover:bg-slate-800 
                      rounded-lg transition-colors duration-150
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info (if logged in) */}
        {user && (
          <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 
                                flex items-center justify-center text-white font-bold text-lg
                                ring-2 ring-white dark:ring-slate-700 shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li 
                  key={item.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-3 font-medium
                              rounded-xl transition-all duration-200 group
                              ${isActive 
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className={`transition-colors ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                    <svg 
                      className={`w-4 h-4 ml-auto transition-all
                                ${isActive 
                                  ? 'text-indigo-400' 
                                  : 'text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1'}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {user ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3
                        text-rose-600 dark:text-rose-400 font-medium rounded-xl
                        border-2 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/20
                        transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center w-full px-4 py-3
                          text-slate-700 dark:text-slate-300 font-medium rounded-xl
                          border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800
                          transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="flex items-center justify-center w-full px-4 py-3
                          text-white font-medium rounded-xl
                          bg-gradient-to-r from-indigo-600 to-violet-600
                          hover:from-indigo-500 hover:to-violet-500
                          shadow-lg shadow-indigo-500/25
                          transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
