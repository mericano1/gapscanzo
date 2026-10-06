import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Extras } from '@/components/Extras';
import { PageHeading } from '@/components/PageHeading';
import { reader, renderMarkdoc } from '@/lib/content';
import nodo from '../../../../../data/nodo.json';

export async function generateMetadata() {
  return { title: 'Il Nodo' };
}

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/** The PDFs are named Il-Nodo-n.12_dicembre-2013_HiRes.pdf: that is the only reliable source for number and date. */
function parseIssue(file: string) {
  const m = file.match(/n\.(\d+)_([a-zà]+)-(\d{4})/i);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  return { file, number: Number(m[1]), month, year: m[3] };
}

export default async function Nodo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, page] = await Promise.all([getTranslations('nodoPage'), reader.collections.pages.read('il-nodo')]);
  const en = locale === 'en' ? await reader.collections.pagesEn.read('il-nodo') : null;
  const body = page ? await renderMarkdoc((en ?? page).content) : null;

  const files = [...new Set(nodo.flatMap((y) => y.issues.map((i) => i.file)))];
  const issues = files.flatMap((f) => parseIssue(f) ?? []).sort((a, b) => b.number - a.number);
  const byYear = Map.groupBy(issues, (i) => i.year);

  const monthName = (m: number) => (m < 0 ? '' : new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, m, 1))));

  return (
    <>
      <PageHeading title="Il Nodo" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {body && <div className="prose prose-lg prose-gap">{body}</div>}
        <h2 className="mt-12 text-2xl font-extrabold">{t('archive')}</h2>
        {[...byYear.entries()].map(([year, list]) => (
          <section key={year} className="mt-6">
            <h3 className="text-xl font-extrabold text-roccia">{year}</h3>
            <ul className="mt-2 border-t border-roccia/15">
              {list.map((i) => (
                <li key={i.file} className="border-b border-roccia/15">
                  <a href={i.file} target="_blank" rel="noopener" className="flex items-baseline justify-between gap-4 py-3 hover:bg-neve">
                    <span className="font-display text-lg font-bold">
                      {t('issue')} {i.number}
                      <span className="ml-2 font-body text-base font-normal text-notte/70">
                        {monthName(i.month)} {i.year}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-roccia">PDF</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {page && <Extras contacts={page.contacts} gallery={page.gallery} />}
      </div>
    </>
  );
}
