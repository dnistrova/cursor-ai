import { useState } from 'react';
import { SettingsTabs } from './SettingsTabs';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { TextInput, TextArea, SelectInput, RadioGroup } from '../common/FormControls';
import type { 
  SettingsTab, 
  UserProfile, 
  NotificationSettings, 
  PrivacySettings, 
  AppearanceSettings 
} from '../../types/settings';

// Tab Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
  { id: 'privacy', label: 'Privacy', icon: <ShieldIcon /> },
  { id: 'appearance', label: 'Appearance', icon: <PaletteIcon /> },
];

interface SettingsPanelProps {
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme?: 'light' | 'dark' | 'system';
}

export function SettingsPanel({ onThemeChange, currentTheme = 'system' }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Product designer passionate about creating beautiful and functional user experiences.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    orderUpdates: true,
    priceAlerts: true,
    newArrivals: false,
    weeklyDigest: true,
  });

  // Privacy State
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: false,
    allowDataCollection: true,
    personalizedAds: false,
    shareWithPartners: false,
    twoFactorAuth: true,
  });

  // Appearance State
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: currentTheme,
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    language: 'en',
    currency: 'USD',
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Apply theme change
    if (onThemeChange && appearance.theme !== currentTheme) {
      onThemeChange(appearance.theme);
    }
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    // Reset to initial values (in real app, this would reset to server values)
    setAppearance(prev => ({ ...prev, theme: currentTheme }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab profile={profile} setProfile={setProfile} />;
      case 'notifications':
        return <NotificationsTab notifications={notifications} setNotifications={setNotifications} />;
      case 'privacy':
        return <PrivacyTab privacy={privacy} setPrivacy={setPrivacy} />;
      case 'appearance':
        return <AppearanceTab appearance={appearance} setAppearance={setAppearance} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden
                    border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="p-4 md:p-6 md:border-r border-slate-200 dark:border-slate-700">
          <SettingsTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700
                      flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Success Message */}
        <div className={`flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400
                        transition-opacity duration-300 ${saveSuccess ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Settings saved successfully!
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300
                      bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600
                      rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                      dark:focus:ring-offset-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-white
                      bg-gradient-to-r from-indigo-600 to-violet-600
                      hover:from-indigo-500 hover:to-violet-500
                      rounded-xl shadow-lg shadow-indigo-500/25
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                      dark:focus:ring-offset-slate-800
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Content
function ProfileTab({ 
  profile, 
  setProfile 
}: { 
  profile: UserProfile; 
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Profile Information
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update your personal information and profile picture
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 
                           flex items-center justify-center text-white text-2xl font-bold
                           ring-4 ring-white dark:ring-slate-700 shadow-lg">
              {profile.firstName.charAt(0)}
            </div>
          )}
          <button
            type="button"
            className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-700 
                      rounded-xl shadow-lg border border-slate-200 dark:border-slate-600
                      hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="Change avatar"
          >
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">Profile Photo</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">JPG, PNG or GIF. Max 2MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="First Name"
          value={profile.firstName}
          onChange={(value) => setProfile(prev => ({ ...prev, firstName: value }))}
          placeholder="Enter first name"
        />
        <TextInput
          label="Last Name"
          value={profile.lastName}
          onChange={(value) => setProfile(prev => ({ ...prev, lastName: value }))}
          placeholder="Enter last name"
        />
      </div>

      <TextInput
        label="Email Address"
        type="email"
        value={profile.email}
        onChange={(value) => setProfile(prev => ({ ...prev, email: value }))}
        placeholder="Enter email address"
      />

      <TextInput
        label="Phone Number"
        type="tel"
        value={profile.phone}
        onChange={(value) => setProfile(prev => ({ ...prev, phone: value }))}
        placeholder="Enter phone number"
      />

      <TextArea
        label="Bio"
        value={profile.bio}
        onChange={(value) => setProfile(prev => ({ ...prev, bio: value }))}
        placeholder="Tell us about yourself..."
        rows={3}
      />
    </div>
  );
}

// Notifications Tab Content
function NotificationsTab({ 
  notifications, 
  setNotifications 
}: { 
  notifications: NotificationSettings; 
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettings>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Notification Preferences
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose how you want to receive notifications
        </p>
      </div>

      {/* Communication Channels */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Communication Channels</h4>
        <div className="space-y-4">
          <ToggleSwitch
            label="Email Notifications"
            description="Receive notifications via email"
            enabled={notifications.emailNotifications}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, emailNotifications: enabled }))}
          />
          <ToggleSwitch
            label="Push Notifications"
            description="Receive push notifications on your devices"
            enabled={notifications.pushNotifications}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, pushNotifications: enabled }))}
          />
          <ToggleSwitch
            label="SMS Notifications"
            description="Receive text messages for important updates"
            enabled={notifications.smsNotifications}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, smsNotifications: enabled }))}
          />
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Notification Types</h4>
        <div className="space-y-4">
          <ToggleSwitch
            label="Order Updates"
            description="Get notified about your order status"
            enabled={notifications.orderUpdates}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, orderUpdates: enabled }))}
          />
          <ToggleSwitch
            label="Price Alerts"
            description="Be notified when items in your wishlist go on sale"
            enabled={notifications.priceAlerts}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, priceAlerts: enabled }))}
          />
          <ToggleSwitch
            label="New Arrivals"
            description="Stay updated on new products"
            enabled={notifications.newArrivals}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, newArrivals: enabled }))}
          />
          <ToggleSwitch
            label="Weekly Digest"
            description="Receive a weekly summary of activity"
            enabled={notifications.weeklyDigest}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, weeklyDigest: enabled }))}
          />
          <ToggleSwitch
            label="Marketing Emails"
            description="Receive promotional emails and offers"
            enabled={notifications.marketingEmails}
            onChange={(enabled) => setNotifications(prev => ({ ...prev, marketingEmails: enabled }))}
          />
        </div>
      </div>
    </div>
  );
}

// Privacy Tab Content
function PrivacyTab({ 
  privacy, 
  setPrivacy 
}: { 
  privacy: PrivacySettings; 
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacySettings>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Privacy & Security
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Control your privacy settings and account security
        </p>
      </div>

      {/* Profile Visibility */}
      <RadioGroup
        label="Profile Visibility"
        name="profileVisibility"
        value={privacy.profileVisibility}
        onChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value as 'public' | 'private' | 'friends' }))}
        options={[
          { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
          { value: 'friends', label: 'Friends Only', description: 'Only friends can see your profile' },
          { value: 'private', label: 'Private', description: 'Only you can see your profile' },
        ]}
      />

      {/* Online Status */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Activity Status</h4>
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Online Status"
            description="Let others see when you're online"
            enabled={privacy.showOnlineStatus}
            onChange={(enabled) => setPrivacy(prev => ({ ...prev, showOnlineStatus: enabled }))}
          />
          <ToggleSwitch
            label="Show Last Seen"
            description="Let others see when you were last active"
            enabled={privacy.showLastSeen}
            onChange={(enabled) => setPrivacy(prev => ({ ...prev, showLastSeen: enabled }))}
          />
        </div>
      </div>

      {/* Data & Advertising */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Data & Advertising</h4>
        <div className="space-y-4">
          <ToggleSwitch
            label="Allow Data Collection"
            description="Help us improve by sharing anonymous usage data"
            enabled={privacy.allowDataCollection}
            onChange={(enabled) => setPrivacy(prev => ({ ...prev, allowDataCollection: enabled }))}
          />
          <ToggleSwitch
            label="Personalized Ads"
            description="See ads based on your interests"
            enabled={privacy.personalizedAds}
            onChange={(enabled) => setPrivacy(prev => ({ ...prev, personalizedAds: enabled }))}
          />
          <ToggleSwitch
            label="Share with Partners"
            description="Share data with trusted partners for better recommendations"
            enabled={privacy.shareWithPartners}
            onChange={(enabled) => setPrivacy(prev => ({ ...prev, shareWithPartners: enabled }))}
          />
        </div>
      </div>

      {/* Security */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Security</h4>
        <ToggleSwitch
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          enabled={privacy.twoFactorAuth}
          onChange={(enabled) => setPrivacy(prev => ({ ...prev, twoFactorAuth: enabled }))}
        />
      </div>
    </div>
  );
}

// Appearance Tab Content
function AppearanceTab({ 
  appearance, 
  setAppearance 
}: { 
  appearance: AppearanceSettings; 
  setAppearance: React.Dispatch<React.SetStateAction<AppearanceSettings>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Appearance
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize how the app looks and feels
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: SunIcon },
            { value: 'dark', label: 'Dark', icon: MoonIcon },
            { value: 'system', label: 'System', icon: ComputerIcon },
          ].map((theme) => {
            const isSelected = appearance.theme === theme.value;
            return (
              <button
                key={theme.value}
                type="button"
                onClick={() => setAppearance(prev => ({ ...prev, theme: theme.value as 'light' | 'dark' | 'system' }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 
                           transition-all duration-200
                           ${isSelected 
                             ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400' 
                             : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}
                aria-pressed={isSelected}
              >
                <theme.icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <SelectInput
        label="Font Size"
        value={appearance.fontSize}
        onChange={(value) => setAppearance(prev => ({ ...prev, fontSize: value as 'small' | 'medium' | 'large' }))}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium (Default)' },
          { value: 'large', label: 'Large' },
        ]}
      />

      {/* Language & Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput
          label="Language"
          value={appearance.language}
          onChange={(value) => setAppearance(prev => ({ ...prev, language: value }))}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'ja', label: '日本語' },
            { value: 'zh', label: '中文' },
          ]}
        />
        <SelectInput
          label="Currency"
          value={appearance.currency}
          onChange={(value) => setAppearance(prev => ({ ...prev, currency: value }))}
          options={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' },
            { value: 'GBP', label: 'GBP (£)' },
            { value: 'JPY', label: 'JPY (¥)' },
            { value: 'CAD', label: 'CAD ($)' },
          ]}
        />
      </div>

      {/* Accessibility */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">Accessibility</h4>
        <div className="space-y-4">
          <ToggleSwitch
            label="Reduced Motion"
            description="Minimize animations throughout the app"
            enabled={appearance.reducedMotion}
            onChange={(enabled) => setAppearance(prev => ({ ...prev, reducedMotion: enabled }))}
          />
          <ToggleSwitch
            label="High Contrast"
            description="Increase contrast for better visibility"
            enabled={appearance.highContrast}
            onChange={(enabled) => setAppearance(prev => ({ ...prev, highContrast: enabled }))}
          />
        </div>
      </div>
    </div>
  );
}

// Theme Icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function ComputerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}





