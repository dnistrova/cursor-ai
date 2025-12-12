import type { ToggleSwitchProps } from '../../types/settings';

const sizeClasses = {
  sm: {
    track: 'w-8 h-5',
    thumb: 'w-3.5 h-3.5',
    translate: 'translate-x-3.5',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-4.5 h-4.5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-5.5 h-5.5',
    translate: 'translate-x-7',
  },
};

export function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleSwitchProps) {
  const sizes = sizeClasses[size];
  const id = label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={id}
              className={`block text-sm font-medium cursor-pointer
                        ${disabled 
                          ? 'text-slate-400 dark:text-slate-500' 
                          : 'text-slate-900 dark:text-white'}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`mt-0.5 text-sm ${disabled 
              ? 'text-slate-300 dark:text-slate-600' 
              : 'text-slate-500 dark:text-slate-400'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative inline-flex flex-shrink-0 ${sizes.track} 
                   rounded-full border-2 border-transparent cursor-pointer
                   transition-colors duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                   dark:focus:ring-offset-slate-800
                   ${enabled 
                     ? 'bg-indigo-600 dark:bg-indigo-500' 
                     : 'bg-slate-200 dark:bg-slate-600'}
                   ${disabled 
                     ? 'opacity-50 cursor-not-allowed' 
                     : 'hover:opacity-90'}`}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block ${sizes.thumb} 
                     rounded-full bg-white shadow-lg ring-0
                     transform transition-transform duration-200 ease-in-out
                     ${enabled ? sizes.translate : 'translate-x-0.5'}`}
          style={{ width: size === 'sm' ? '14px' : size === 'lg' ? '22px' : '18px',
                   height: size === 'sm' ? '14px' : size === 'lg' ? '22px' : '18px' }}
        />
      </button>
    </div>
  );
}





