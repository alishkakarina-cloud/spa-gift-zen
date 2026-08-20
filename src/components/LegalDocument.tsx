import { Link } from "@tanstack/react-router";

export type LegalSection = {
  heading?: string;
  /** Каждая строка — отдельный абзац/пункт; переносы сохраняются как есть. */
  paragraphs: string[];
};

type Props = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

/** Общий каркас для юридических страниц (политика, оферта, правила
 *  сертификатов) — единое оформление, текст передаётся данными. */
export function LegalDocument({ title, updated, sections }: Props) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
      <Link to="/" className="text-cream/50 hover:text-gold text-xs transition-colors">
        ← На главную
      </Link>
      <p className="eyebrow mt-6">RAI THAI SPA</p>
      <h1 className="font-display mt-4 text-2xl sm:text-3xl">{title}</h1>
      <p className="text-cream/45 mt-2 text-xs">{updated}</p>

      <div className="text-cream/75 mt-10 space-y-7 text-sm leading-relaxed">
        {sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="font-display text-cream mb-2.5 text-base sm:text-lg">{s.heading}</h2>
            )}
            {s.paragraphs.map((p, j) => (
              <p key={j} className="mt-2 whitespace-pre-line first:mt-0">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
