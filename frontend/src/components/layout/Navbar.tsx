import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavbarProps } from '../../types/navigation';
import { MobileMenu } from './MobileMenu';
import { UserDropdown } from './UserDropdown';

export function Navbar({ logo, navItems, user, onSearch, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  // Handle scroll for sticky navbar effect
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
                   ${isScrolled 
                     ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_2px_20px_-2px_rgba(0,0,0,0.1)] dark:shadow-slate-900/50' 
                     : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'}`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo || (
                <Link 
                  to="/" 
                  className="flex items-center gap-2 group"
                  aria-label="Home"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl
                                flex items-center justify-center shadow-lg shadow-indigo-500/30
                                group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 
                                  bg-clip-text text-transparent hidden sm:block">
                    ShopFlow
                  </span>
                </Link>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg
                               transition-all duration-200
                               ${isActive 
                                 ? 'text-indigo-600 dark:text-indigo-400' 
                                 : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 
                                      bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className={`hidden md:flex items-center transition-all duration-300
                         ${isSearchFocused ? 'w-80' : 'w-64'}`}
            >
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                            border-2 transition-all duration-200
                            placeholder:text-slate-400 dark:placeholder:text-slate-500
                            text-slate-900 dark:text-white
                            focus:outline-none
                            ${isSearchFocused 
                              ? 'border-indigo-500 bg-white dark:bg-slate-800 shadow-lg shadow-indigo-500/10' 
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  aria-label="Search products"
                />
                <svg
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors
                            ${isSearchFocused ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                              text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search Button */}
              <button
                type="button"
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
                          hover:bg-slate-100 dark:hover:bg-slate-800 
                          rounded-lg transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart Button */}
              <button
                type="button"
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
                          hover:bg-slate-100 dark:hover:bg-slate-800 
                          rounded-lg transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Shopping cart"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {/* Cart Badge */}
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-600 text-white 
                                text-[10px] font-bold rounded-full flex items-center justify-center
                                ring-2 ring-white dark:ring-slate-900">
                  3
                </span>
              </button>

              {/* User Section */}
              {user ? (
                <UserDropdown user={user} onLogout={onLogout} />
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
                              hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-semibold text-white
                              bg-gradient-to-r from-indigo-600 to-violet-600
                              hover:from-indigo-500 hover:to-violet-500
                              rounded-lg shadow-md shadow-indigo-500/25
                              hover:shadow-lg hover:shadow-indigo-500/30
                              transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
                          hover:bg-slate-100 dark:hover:bg-slate-800 
                          rounded-lg transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        user={user}
        onLogout={onLogout}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
