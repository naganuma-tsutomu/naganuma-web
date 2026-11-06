type InteriorPageHeaderProps = {
  title: string;
  titleId?: string;
  kicker: string;
  description: string;
  meta: string;
  action?: { href: string; label: string };
};

export default function InteriorPageHeader({ title, titleId, kicker, description, meta, action }: InteriorPageHeaderProps) {
  return (
    <header data-page-intro className="mb-9 border-b border-[var(--ink)] pt-3 pb-7 @min-[700px]/reader:mb-10 @min-[700px]/reader:pt-4 @min-[700px]/reader:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 font-[family-name:var(--mono)] text-[10px] leading-[1.6] tracking-[.08em] text-[var(--text-sub)]">
        <span className="inline-flex items-center gap-2.5"><span className="h-1 w-1 shrink-0 bg-[var(--red)]" aria-hidden="true" />{kicker}</span>
        <span>{meta}</span>
      </div>
      <h1 id={titleId} className="mt-4 mb-3 font-[family-name:var(--font-oswald),sans-serif] text-[clamp(40px,6cqw,64px)] leading-[1.05] font-bold tracking-[.01em] text-[var(--ink)]">{title}<span className="text-[var(--red)]">.</span></h1>
      <p className="m-0 max-w-[640px] text-sm leading-[1.9] text-[var(--text-sub)]">{description}</p>
      {action && <a href={action.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block border-b border-current pb-0.5 font-[family-name:var(--mono)] text-[10px] leading-[1.6] tracking-[.06em] text-[var(--teal)] no-underline transition-colors hover:text-[var(--red)]">{action.label}<span className="sr-only">（新しいタブで開きます）</span></a>}
    </header>
  );
}
