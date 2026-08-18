import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

/* ================= BUTTON ================= */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27272A]/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer';

  const variants = {
    primary: 'bg-[#27272A] hover:bg-zinc-800 text-white shadow-sm',
    secondary: 'bg-[#FFB6D9]/20 hover:bg-[#FFB6D9]/30 text-[#27272A] font-semibold',
    tertiary: 'bg-[#F26CA7] hover:bg-[#e05593] text-white shadow-sm glow-pink',
    outline: 'border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-800',
    ghost: 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900',
    dark: 'bg-[#27272A] hover:bg-zinc-800 text-white shadow-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
};

/* ================= INPUT ================= */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-700 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3.5 text-zinc-400 pointer-events-none">{icon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl py-2.5 px-3.5 transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 focus:border-[#F26CA7] focus:ring-2 focus:ring-[#F26CA7]/20 focus:outline-none ${
              icon ? 'pl-10' : ''
            } ${rightElement ? 'pr-12' : ''} ${error ? 'border-red-500 focus:ring-red-200' : ''} ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute right-3.5 flex items-center">{rightElement}</div>}
        </div>
        {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ================= SELECT ================= */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', id, ...props }) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-zinc-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl py-2.5 px-3.5 transition-[border-color,box-shadow] duration-200 focus:border-[#F26CA7] focus:ring-2 focus:ring-[#F26CA7]/20 focus:outline-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
};

/* ================= CARD ================= */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false, onClick, id }) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 transition-[transform,box-shadow] duration-200 ${
        hoverEffect ? 'hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ================= BADGE ================= */
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'dark' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-white text-[#27272A] border-[#FF73B6]/60 shadow-[0_4px_7px_rgba(0,0,0,0.08)]',
    secondary: 'bg-white text-[#27272A] border-[#FF73B6]/60 shadow-[0_4px_7px_rgba(0,0,0,0.08)]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    dark: 'bg-zinc-900 text-white border-zinc-800',
    outline: 'bg-white text-[#27272A] border-[#FF73B6]/60 shadow-[0_4px_7px_rgba(0,0,0,0.08)]'
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/* ================= AVATAR ================= */
export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-tr from-[#F26CA7] to-[#FFB6D9] text-white font-bold shrink-0 shadow-xs border-2 border-white ${sizes[size]} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

/* ================= PROGRESS ================= */
export interface ProgressProps {
  value: number; // 0-100
  label?: React.ReactNode;
  showPercent?: boolean;
  className?: string;
  barColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, label, showPercent = true, className = '', barColor = 'bg-[#F26CA7]' }) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-zinc-600 font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-semibold text-zinc-900">{clamped}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/* ================= MODAL / DIALOG ================= */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, maxWidth = 'md' }) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className={`w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto ${widthClasses[maxWidth]}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                {title && <h3 className="text-xl font-bold text-zinc-900 leading-snug">{title}</h3>}
                {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition-colors active:scale-95"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ================= DRAWER ================= */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex justify-end bg-zinc-950/50 backdrop-blur-xs"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
              <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition-colors active:scale-95"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ================= TABS ================= */
export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200/60 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive ? 'bg-[#F26CA7]/10 text-[#F26CA7]' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ================= ACCORDION ================= */
export interface AccordionProps {
  items: { id: string; title: string; content: React.ReactNode }[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id || null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border border-zinc-200/80 rounded-2xl bg-white overflow-hidden transition-all duration-200">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex justify-between items-center p-5 text-left font-semibold text-zinc-900 transition-colors cursor-pointer"
            >
              <span className="text-base">{item.title}</span>
              <span className={`text-zinc-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F26CA7]' : ''}`}>
                ↓
              </span>
            </button>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 pb-5 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3"
              >
                {item.content}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ================= EMPTY STATE ================= */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-200 my-4">
      {icon && <div className="p-4 bg-[#FFB6D9]/20 rounded-full text-[#F26CA7] mb-4">{icon}</div>}
      <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm mt-1.5 mb-6">{description}</p>
      {action}
    </div>
  );
};

/* ================= SKELETON ================= */
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return <div className={`bg-zinc-200/70 animate-pulse rounded-xl ${className}`} />;
};
