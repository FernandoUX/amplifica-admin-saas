import Button from "./Button";
import { IconPlus } from "@tabler/icons-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  onCreateClick?: () => void;
  createLabel?: string;
}

export default function EmptyState({
  icon,
  title,
  onCreateClick,
  createLabel = "Crear",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400">
        {icon}
      </div>
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      {onCreateClick && (
        <Button variant="secondary" size="md" onClick={onCreateClick} icon={<IconPlus size={14} />}>
          {createLabel}
        </Button>
      )}
    </div>
  );
}
