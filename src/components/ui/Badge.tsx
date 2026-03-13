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
  active:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
  inactive:   "bg-neutral-100 text-neutral-500 border border-neutral-200",
  pending:    "bg-amber-50 text-amber-700 border border-amber-200",
  vencido:    "bg-red-50 text-red-700 border border-red-200",
  trial:      "bg-blue-50 text-blue-700 border border-blue-200",
  express:    "bg-violet-50 text-violet-700 border border-violet-200",
  "envios-pro": "bg-primary-25 text-primary-700 border border-primary-100",
  multicanal: "bg-orange-50 text-orange-700 border border-orange-200",
  default:    "bg-neutral-100 text-neutral-600 border border-neutral-200",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
