import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumb?: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stickyMobileAction?: React.ReactNode;
}

export default function PageHeader({ breadcrumb, title, description, actions, stickyMobileAction }: PageHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-3 px-4 sm:px-6 pt-5 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-0.5">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 text-xs text-neutral-400">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-neutral-600 transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
        </div>
        {(actions || stickyMobileAction) && (
          <div className="flex items-center gap-2 sm:flex-shrink-0 w-full sm:w-auto">
            {actions}
            {stickyMobileAction && (
              <div className="hidden sm:flex">{stickyMobileAction}</div>
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom bar — mobile only */}
      {stickyMobileAction && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-neutral-200 bg-white px-4 py-3 sm:hidden">
          {stickyMobileAction}
        </div>
      )}
    </>
  );
}
