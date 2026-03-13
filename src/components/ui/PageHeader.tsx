interface PageHeaderProps {
  breadcrumb?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ breadcrumb, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 px-4 sm:px-6 pt-5 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-0.5">
        {breadcrumb && (
          <p className="text-xs text-neutral-400">{breadcrumb}</p>
        )}
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
