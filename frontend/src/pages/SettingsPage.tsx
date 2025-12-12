import { SettingsPanel } from '../components/settings/SettingsPanel';

interface SettingsPageProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function SettingsPage({ currentTheme, onThemeChange }: SettingsPageProps) {
  return (
    <section className="relative z-10 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SettingsPanel
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
        />
      </div>
    </section>
  );
}





