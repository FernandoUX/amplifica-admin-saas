interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ breadcrumb, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
      <div className="flex flex-col gap-0.5">
        {breadcrumb && (
          <p className="text-xs text-neutral-400">{breadcrumb}</p>
        )}
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
