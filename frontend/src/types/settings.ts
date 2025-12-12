export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  avatar?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newArrivals: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDataCollection: boolean;
  personalizedAds: boolean;
  shareWithPartners: boolean;
  twoFactorAuth: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
  language: string;
  currency: string;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
}

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  disabled?: boolean;
  error?: string;
}





