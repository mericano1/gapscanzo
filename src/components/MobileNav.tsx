'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { navGroups } from './nav';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');
  const close = () => setOpen(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md bg-notte px-4 py-2 text-sm font-bold text-white"
      >
        {open ? t('close') : t('menu')}
      </button>
      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full z-20 max-h-[80vh] overflow-y-auto bg-notte px-4 pb-8 pt-4 text-white shadow-xl">
          {navGroups.map((g) => (
            <div key={g.key} className="border-b border-white/15 py-3">
              {g.children ? (
                <>
                  <p className="font-display text-lg font-bold text-cielo">{t(g.key)}</p>
                  <ul className="mt-1">
                    {g.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} onClick={close} className="block py-2 text-base">
                          {t(c.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link href={g.href!} onClick={close} className="block py-1 font-display text-lg font-bold">
                  {t(g.key)}
                </Link>
              )}
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
