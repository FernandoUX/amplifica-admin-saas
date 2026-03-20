interface DSSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function DSSection({ id, title, description, children }: DSSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 pb-16">
      <div className="mb-6 border-b border-neutral-200 pb-4">
        <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function DSSubsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-neutral-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function DSShowcase({ label, children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="mb-4">
      {label && <p className="text-xs font-medium text-neutral-500 mb-2">{label}</p>}
      <div className={`rounded-xl border border-neutral-200 bg-neutral-50 p-6 ${className}`}>
        {children}
      </div>
    </div>
  );
}
