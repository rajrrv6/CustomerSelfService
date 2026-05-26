import { Eye, EyeOff } from 'lucide-react';

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
  labelVisible: string;
  labelHidden: string;
}

export function PasswordVisibilityToggle({
  visible,
  onToggle,
  labelVisible,
  labelHidden,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
    >
      {visible ? <EyeOff className="w-3.5 h-3.5" aria-hidden /> : <Eye className="w-3.5 h-3.5" aria-hidden />}
      <span>{visible ? labelVisible : labelHidden}</span>
    </button>
  );
}