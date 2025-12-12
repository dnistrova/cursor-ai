import type { TextInputProps, SelectInputProps } from '../../types/settings';

export function TextInput({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  error,
}: TextInputProps) {
  const id = label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium 
                    ${disabled 
                      ? 'text-slate-400 dark:text-slate-500' 
                      : 'text-slate-700 dark:text-slate-200'}`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full px-4 py-2.5 text-sm rounded-xl
                   border-2 transition-all duration-200
                   bg-white dark:bg-slate-800
                   text-slate-900 dark:text-white
                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                   focus:outline-none focus:ring-0
                   ${error 
                     ? 'border-rose-500 focus:border-rose-500' 
                     : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400'}
                   ${disabled 
                     ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-700' 
                     : 'hover:border-slate-300 dark:hover:border-slate-500'}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-rose-500 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  rows = 4,
}: TextInputProps & { rows?: number }) {
  const id = label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium 
                    ${disabled 
                      ? 'text-slate-400 dark:text-slate-500' 
                      : 'text-slate-700 dark:text-slate-200'}`}
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`block w-full px-4 py-2.5 text-sm rounded-xl
                   border-2 transition-all duration-200 resize-none
                   bg-white dark:bg-slate-800
                   text-slate-900 dark:text-white
                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                   focus:outline-none focus:ring-0
                   border-slate-200 dark:border-slate-600 
                   focus:border-indigo-500 dark:focus:border-indigo-400
                   ${disabled 
                     ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-700' 
                     : 'hover:border-slate-300 dark:hover:border-slate-500'}`}
      />
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  label,
  disabled = false,
}: SelectInputProps) {
  const id = label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium 
                    ${disabled 
                      ? 'text-slate-400 dark:text-slate-500' 
                      : 'text-slate-700 dark:text-slate-200'}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`block w-full px-4 py-2.5 text-sm rounded-xl appearance-none
                     border-2 transition-all duration-200
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-white
                     focus:outline-none focus:ring-0
                     border-slate-200 dark:border-slate-600 
                     focus:border-indigo-500 dark:focus:border-indigo-400
                     pr-10
                     ${disabled 
                       ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-700' 
                       : 'hover:border-slate-300 dark:hover:border-slate-500 cursor-pointer'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className="w-5 h-5 text-slate-400 dark:text-slate-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function RadioGroup({
  value,
  onChange,
  options,
  label,
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  label?: string;
  name: string;
}) {
  return (
    <fieldset className="space-y-3">
      {label && (
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </legend>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer
                       transition-all duration-200
                       ${value === option.value 
                         ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400' 
                         : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 
                        focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-700
                        dark:focus:ring-indigo-400 dark:focus:ring-offset-slate-800"
            />
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-slate-900 dark:text-white">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}





