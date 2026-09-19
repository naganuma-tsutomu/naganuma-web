import Link from "next/link";

interface ListPaginationProps {
  path: string;
  page: number;
  totalPages: number;
}

export default function ListPagination({ path, page, totalPages }: ListPaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (target: number) => target === 1 ? path : `${path}?page=${target}`;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const directionClass = "border-b border-current text-inherit no-underline hover:text-[var(--red)]";

  return (
    <nav className="mt-9 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 border-t border-[var(--ink)] pt-[18px] font-[family-name:var(--mono)] text-xs leading-[1.6] tracking-[0.06em]" aria-label="ページ切り替え">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} rel="prev" className={directionClass}>← PREV</Link>
      ) : (
        <span aria-disabled="true" className="opacity-45">← PREV</span>
      )}
      <ol className="m-0 flex list-none flex-wrap justify-center gap-[6px] p-0">
        {pages.map(target => (
          <li key={target}>
            <Link
              href={pageHref(target)}
              aria-label={`${target}ページ目`}
              aria-current={target === page ? "page" : undefined}
              className="grid h-8 min-w-8 place-items-center border border-[var(--ink)] text-inherit no-underline aria-[current=page]:bg-[var(--ink)] aria-[current=page]:text-[var(--paper)] hover:bg-[var(--orange)] hover:text-[var(--ink)] aria-[current=page]:hover:bg-[var(--ink)] aria-[current=page]:hover:text-[var(--paper)]"
            >
              {target}
            </Link>
          </li>
        ))}
      </ol>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)} rel="next" className={directionClass}>NEXT →</Link>
      ) : (
        <span aria-disabled="true" className="opacity-45">NEXT →</span>
      )}
    </nav>
  );
}
