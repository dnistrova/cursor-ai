export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  navItems: NavItem[];
  user?: User | null;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  user?: User | null;
  onLogout?: () => void;
}

export interface UserDropdownProps {
  user: User;
  onLogout?: () => void;
}

export interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

