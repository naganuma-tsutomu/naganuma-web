import Link from "next/link";

interface BasePillar {
  index: string;
  tag: string;
  title: string;
  jpTitle: string;
  description: string;
  href: string;
  actionText: string;
  badge?: string;
  isUp?: boolean;
}

const pillars: BasePillar[] = [
  {
    index: "01",
    tag: "PRODUCTS & APPS",
    title: "PROJECTS",
    jpTitle: "制作物・プロダクト",
    description:
      "Webアプリケーション、ツール、デザインなど、個人開発の制作アーカイブ。",
    href: "#projects",
    actionText: "VIEW PROJECTS",
  },
  {
    index: "02",
    tag: "LOGS & TECH",
    title: "NOTES",
    jpTitle: "技術メモ・試行錯誤",
    description:
      "日々の開発で得た知見やトラブルシューティング、思考ログの記録。",
    href: "#notes",
    actionText: "READ NOTES",
  },
  {
    index: "03",
    tag: "INFRASTRUCTURE",
    title: "HOMELAB",
    jpTitle: "自宅サーバー・検証環境",
    description:
      "常時稼働の仮想化基盤。上部のターミナルやステータスパネルでリアルタイム監視中。",
    href: "#home",
    actionText: "CHECK SYSTEM",
    badge: "LIVE",
    isUp: true,
  },
];

export default function AboutBaseSection() {
  return (
    <div className="flex flex-col">
      {/* ── メインステートメント ── */}
      <div className="grid grid-cols-[2fr_1fr] border-t-2 border-b border-[var(--ink)] border-b-[#a8b5a9] max-[1023px]:grid-cols-1">
        {/* 左: ステートメント本文 */}
        <div className="border-r border-[#a8b5a9] py-7 pr-9 max-[1023px]:border-r-0 max-[1023px]:border-b max-[1023px]:border-b-[#a8b5a9] max-[1023px]:py-6 max-[1023px]:pr-0">
          <div className="mb-4 flex items-center gap-2 font-[family-name:var(--mono)] text-[10px] font-bold leading-[1.4] tracking-[0.12em] text-[var(--red)]">
            <span className="h-1.5 w-1.5 shrink-0 bg-[var(--red)]" aria-hidden="true" />
            <span>STATION IDENTITY</span>
            <span className="h-px w-[18px] shrink-0 bg-[var(--red)] opacity-50" aria-hidden="true" />
            <span>NAGANUMA.WEB</span>
          </div>

          <h3 className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.4] tracking-[0.02em] text-[var(--ink)]">
            つくって、試して、記録する。
            <br className="hidden sm:inline" />
            個人の技術発信基地。
          </h3>

          <p className="mt-3.5 mb-0 max-w-[620px] text-sm leading-[2] text-[var(--text-sub)] max-[768px]:text-[13px]">
            ソフトウェアエンジニア{" "}
            <strong className="font-bold text-[var(--ink)]">NAGANUMA</strong>{" "}
            の個人発信基地です。Web開発からサーバー構築、自宅ラックサーバーの運用まで、日々の実験や制作物、学んだ知識をオープンにストックしています。
          </p>
        </div>

        {/* 右: プロフィール */}
        <div className="flex flex-col justify-between py-7 pl-8 max-[1023px]:py-[22px] max-[1023px]:pl-0">
          <dl className="m-0 grid gap-3 font-[family-name:var(--mono)] text-xs leading-[1.45]">
            <div>
              <dt className="text-[10px] tracking-[0.1em] text-[var(--teal)]">NAME</dt>
              <dd className="mt-0.5 ml-0 font-bold text-[var(--ink)]">NAGANUMA</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] text-[var(--teal)]">ROLE</dt>
              <dd className="mt-0.5 ml-0 font-bold text-[var(--ink)]">SOFTWARE ENGINEER</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.1em] text-[var(--teal)]">FOCUS</dt>
              <dd className="mt-0.5 ml-0 font-bold text-[var(--ink)]">WEB / SERVER / HOMELAB</dd>
            </div>
          </dl>
          <Link
            href="/about"
            className="mt-5 inline-flex items-center justify-between gap-3 border-b border-[var(--ink)] pb-1 font-[family-name:var(--mono)] text-[11px] font-bold leading-[1.5] tracking-[0.06em] text-[var(--ink)] no-underline transition-colors duration-150 hover:border-[var(--red)] hover:text-[var(--red)]"
          >
            <span>FULL PROFILE</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      {/* ── 3つの柱 ── */}
      <div className="about-base-pillars grid grid-cols-3 border-b-2 border-[var(--ink)] max-[768px]:grid-cols-1" role="list">
        {pillars.map((pillar, i) => (
          <div
            key={pillar.title}
            className={`flex flex-col py-6 max-[768px]:py-5 ${
              i > 0
                ? "border-l border-[#a8b5a9] pl-7 max-[768px]:border-l-0 max-[768px]:border-t max-[768px]:border-t-[#a8b5a9] max-[768px]:pl-0"
                : ""
            } ${i < 2 ? "pr-7 max-[768px]:pr-0" : ""}`}
            role="listitem"
          >
            <div className="mb-2.5 flex items-center justify-between font-[family-name:var(--mono)] text-[11px] leading-[1.4] tracking-[0.06em] text-[var(--text-sub)]">
              <span className="font-bold text-[var(--red)]">{pillar.index}</span>
              <span className="tracking-[0.08em]">{pillar.tag}</span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <h4 className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-[clamp(22px,1.8vw,28px)] font-bold leading-[1.2] tracking-[0.04em] text-[var(--ink)]">
                {pillar.title}
              </h4>
              {pillar.badge && (
                <span className="shrink-0 bg-[var(--teal)] px-1.5 py-px font-[family-name:var(--mono)] text-[9px] font-bold leading-[1.5] tracking-[0.06em] text-[var(--aqua)]">
                  {pillar.badge}
                </span>
              )}
            </div>

            <p className="mt-1 mb-0 font-[family-name:var(--mono)] text-xs leading-[1.6] text-[#426b65]">
              {pillar.jpTitle}
            </p>

            <p className="mt-3 mb-0 flex-1 text-[13px] leading-[1.85] text-[var(--text-sub)]">
              {pillar.description}
            </p>

            <a
              href={pillar.href}
              className="mt-[18px] inline-flex items-center gap-1.5 font-[family-name:var(--mono)] text-[11px] font-bold leading-[1.5] tracking-[0.06em] text-[var(--ink)] no-underline transition-colors duration-150 hover:text-[var(--red)]"
            >
              <span>{pillar.actionText}</span>
              <span aria-hidden="true">{pillar.isUp ? "↑" : "↓"}</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
