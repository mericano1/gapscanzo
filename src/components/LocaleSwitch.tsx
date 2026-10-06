'use client';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitch() {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations('nav');
  return (
    <div role="group" aria-label={t('language')} className="flex items-center gap-1 text-sm font-bold">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          aria-current={l === current ? 'true' : undefined}
          className={`rounded px-2 py-1 uppercase ${l === current ? 'bg-notte text-white' : 'hover:bg-white/40'}`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
