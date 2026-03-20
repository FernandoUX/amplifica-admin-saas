import { ButtonHTMLAttributes, forwardRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "btn-primary text-white disabled:opacity-50",
  secondary:
    "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-50",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  xs:  "h-6 px-2 text-[11px] gap-1",
  sm:  "h-8 px-3 text-xs gap-1.5",
  md:  "h-11 px-4 text-[14px] md:text-sm gap-2",
  lg:  "h-12 px-5 text-[14px] md:text-sm gap-2",
  xl:  "h-12 px-5 text-[14px] gap-2",
  "2xl": "h-14 px-6 text-[14px] gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <IconLoader2 size={14} className="animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
