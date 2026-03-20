type BadgeVariant =
  | "active"
  | "inactive"
  | "pending"
  | "vencido"
  | "trial"
  | "express"
  | "envios-pro"
  | "multicanal"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active:     "bg-emerald-50 text-emerald-800",
  inactive:   "bg-neutral-100 text-neutral-700",
  pending:    "bg-amber-50 text-amber-800",
  vencido:    "bg-red-50 text-red-800",
  trial:      "bg-blue-50 text-blue-800",
  express:    "bg-violet-50 text-violet-800",
  "envios-pro": "bg-primary-25 text-primary-800",
  multicanal: "bg-orange-50 text-orange-800",
  default:    "bg-neutral-100 text-neutral-700",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium badge-${variant} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
