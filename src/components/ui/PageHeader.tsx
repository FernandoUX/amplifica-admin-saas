import Link from "next/link";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";

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
      {/* Mobile: back button + centered content | Desktop: normal flow */}
      <div className="relative px-4 sm:px-6 pt-5 pb-6">
        {/* Mobile back button — vertically centered with breadcrumb+title block */}
        {breadcrumb && breadcrumb.length >= 2 && (() => {
          const backItem = [...breadcrumb].reverse().find((b) => b.href);
          return backItem?.href ? (
            <Link href={backItem.href} className="sm:hidden absolute left-4 top-5 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
              <IconChevronLeft size={18} />
            </Link>
          ) : null;
        })()}

        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex justify-center sm:justify-start mb-2">
            <nav className="flex items-center gap-1 text-xs font-medium text-neutral-500">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <IconChevronRight size={12} className="text-neutral-400" />}
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
          </div>
        )}

        {/* Title + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
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
      </div>

      {/* Sticky bottom bar — mobile only */}
      {stickyMobileAction && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-neutral-200 bg-white px-4 py-3 pb-6 sm:hidden">
          {stickyMobileAction}
        </div>
      )}
    </>
  );
}
