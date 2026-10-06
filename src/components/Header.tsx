import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { site } from '@/lib/site';
import { LocaleSwitch } from './LocaleSwitch';
import { MobileNav } from './MobileNav';
import { navGroups } from './nav';

export async function Header() {
  const t = await getTranslations('nav');
  return (
    <header className="relative z-10 bg-cielo text-notte">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.png" alt="" width={44} height={44} className="h-11 w-11" />
          <span className="font-display text-lg font-bold leading-tight">
            Gruppo Alpinistico
            <br />
            Presolana
          </span>
          <span className="sr-only"> – {site.short}</span>
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-1 lg:flex">
          {navGroups.map((g) =>
            g.children ? (
              <div key={g.key} className="group relative">
                <button type="button" className="rounded px-3 py-2 font-bold hover:bg-white/40 group-focus-within:bg-white/40">
                  {t(g.key)}
                </button>
                <ul className="invisible absolute left-0 top-full min-w-48 rounded-md bg-white py-2 text-notte opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {g.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className="block px-4 py-2 hover:bg-neve">
                        {t(c.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link key={g.key} href={g.href!} className="rounded px-3 py-2 font-bold hover:bg-white/40">
                {t(g.key)}
              </Link>
            ),
          )}
          <LocaleSwitch />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <LocaleSwitch />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
