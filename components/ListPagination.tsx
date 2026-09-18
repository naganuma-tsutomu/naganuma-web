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

  return (
    <nav className="list-pagination" aria-label="ページ切り替え">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} rel="prev">← PREV</Link>
      ) : (
        <span aria-disabled="true">← PREV</span>
      )}
      <ol className="list-pagination-pages">
        {pages.map(target => (
          <li key={target}>
            <Link
              href={pageHref(target)}
              aria-label={`${target}ページ目`}
              aria-current={target === page ? "page" : undefined}
            >
              {target}
            </Link>
          </li>
        ))}
      </ol>
      {page < totalPages ? (
        <Link href={pageHref(page + 1)} rel="next">NEXT →</Link>
      ) : (
        <span aria-disabled="true">NEXT →</span>
      )}
    </nav>
  );
}
