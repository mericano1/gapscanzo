import type { Metadata } from 'next';
import { Bricolage_Grotesque, Mulish } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { routing } from '@/i18n/routing';
import '../../globals.css';

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const mulish = Mulish({ subsets: ['latin'], variable: '--font-mulish', display: 'swap' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: { default: 'GAP – Gruppo Alpinistico Presolana', template: '%s | GAP' },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const skip = (await getTranslations({ locale, namespace: 'nav' }))('skip');
  return (
    <html lang={locale} className={`${bricolage.variable} ${mulish.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-larice focus:px-4 focus:py-2 focus:font-bold">
            {skip}
          </a>
          <Header />
          <div id="main" className="flex-1">
            {children}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
