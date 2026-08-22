import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { InstagramLinks } from "@/components/BranchesSection";
import { BRANCHES, COMPANY_EMAIL } from "@/data/branches";
import logoLight from "@/assets/logo-on-dark.webp";

/**
 * Футер — структура сверена вживую с layan.kz (открыли их сайт, дошли до
 * конца, прочитали DOM их <footer> напрямую): Instagram → логотип →
 * контакты → юр. ссылки → кнопка → копирайт → платёжные иконки. У layan «Мы
 * в Instagram» физически лежит внутри <footer> самым первым блоком, а не
 * отдельной секцией перед ним.
 *
 * Раньше был вписан прямо в /services и нигде больше — из-за этого его не
 * было видно ни на "/", ни на /offers (у обеих страниц свой собственный
 * <main>, футер туда не долетал). Вынесен в общий компонент и подключён на
 * все публичные маршруты сайта (/, /offers, /services), кроме /certificate
 * (мастер оформления — трогать не просили) и /admin/* (служебная область).
 *
 * Телефон/email: владелец подтвердил email (raithai2024@gmail.com,
 * 2026-08-18) и явно попросил оставить оба филиала отдельно вместо единого
 * номера, как у layan, — так и сделано ниже.
 *
 * Юр. ссылки и реквизиты (ТОО «RAITHAI KAZAKHSTAN», БИН 221140025600) —
 * тексты документов получены от владельца 2026-08-20, страницы созданы
 * (/privacy-policy, /offer, /certificate-rules).
 *
 * Иконок платёжных систем всё ещё нет — на сайте нет ни одной подключённой
 * платёжки (Kaspi QR — демо-заглушка, Freedom Pay убран владельцем совсем,
 * см. CLAUDE.md), поэтому наугад Mastercard/Visa не показываем. Появятся,
 * когда подключится реальная оплата — после копирайта, как у layan.
 */
export function SiteFooter({ t }: { t: (path: string) => string }) {
  return (
    <footer className="relative overflow-hidden">
      <div className="text-cream/50 relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-10 text-center text-xs sm:py-16">
        <div className="w-full max-w-3xl">
          <InstagramLinks t={t} />
        </div>

        <img
          src={logoLight}
          alt="RaiThai Massage & Spa"
          width={900}
          height={778}
          loading="lazy"
          className="h-12 w-auto opacity-70 sm:h-14"
        />

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {BRANCHES.map((b) => (
            <a
              key={b.id}
              href={b.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/70 hover:text-gold transition-colors"
            >
              {t(b.labelKey)}: WhatsApp
            </a>
          ))}
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="text-cream/70 hover:text-gold inline-flex items-center gap-1.5 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {COMPANY_EMAIL}
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[0.7rem]">
          <Link to="/privacy-policy" className="text-cream/50 hover:text-gold transition-colors">
            {t("footer.legalPrivacy")}
          </Link>
          <Link to="/cookie-policy" className="text-cream/50 hover:text-gold transition-colors">
            {t("footer.legalCookie")}
          </Link>
          <Link to="/offer" className="text-cream/50 hover:text-gold transition-colors">
            {t("footer.legalOffer")}
          </Link>
          <Link to="/certificate-rules" className="text-cream/50 hover:text-gold transition-colors">
            {t("footer.legalCertRules")}
          </Link>
        </div>

        <Link to="/offers" className="btn-gold w-full max-w-sm">
          {t("home.heroCta")}
        </Link>

        <div className="text-cream/40 space-y-1">
          <p>
            © {new Date().getFullYear()} Rai Thai Spa. {t("footer.rights")}
          </p>
          <p className="text-cream/30 text-[0.65rem]">
            ТОО «RAITHAI KAZAKHSTAN», БИН 221140025600, Казахстан, г. Кокшетау, ул. Мактая Сагдиева,
            д. 44
          </p>
        </div>
      </div>
    </footer>
  );
}
