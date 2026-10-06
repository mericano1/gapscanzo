import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageHeading } from '@/components/PageHeading';
import { Photo } from '@/components/Photo';
import { Link } from '@/i18n/navigation';
import { activityTiles } from '@/lib/content';

export async function generateMetadata() {
  return { title: 'Attività' };
}

export default async function Activities({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const lang = locale === 'en' ? 'en' : 'it';
  return (
    <>
      <PageHeading title={t('activities')} />
      <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {activityTiles.map((a) => (
          <li key={a.slug}>
            <Link href={a.href} className="group relative block aspect-[16/9] overflow-hidden rounded-lg bg-roccia">
              <Photo src={`/media/site/${a.image}.webp`} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-notte/85 to-transparent p-4 pt-10 font-display text-2xl font-bold text-white">{a.label[lang]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
