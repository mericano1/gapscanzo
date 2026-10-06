import { Link } from '@/i18n/navigation';
import { fmtDate } from '@/lib/content';

type Props = {
  slug: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  categories?: readonly string[];
  locale: string;
};

export function EventRow({ slug, title, startDate, endDate, startTime, categories = [], locale }: Props) {
  const day = fmtDate(startDate, locale, { day: 'numeric' });
  const month = fmtDate(startDate, locale, { month: 'short' });
  const range = endDate && endDate !== startDate ? `${fmtDate(startDate, locale, { day: 'numeric', month: 'short' })} – ${fmtDate(endDate, locale, { day: 'numeric', month: 'short', year: 'numeric' })}` : fmtDate(startDate, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <li className="grid grid-cols-[4.5rem_1fr] items-center gap-4 border-b border-roccia/15 py-4">
      <div className="text-center leading-none" aria-hidden="true">
        <span className="block font-display text-4xl font-extrabold text-roccia">{day}</span>
        <span className="mt-1 block text-sm font-bold uppercase tracking-wide text-notte/70">{month}</span>
      </div>
      <div>
        <Link href={`/calendario/${slug}`} className="font-display text-xl font-bold hover:underline">
          {title}
        </Link>
        <p className="text-sm text-notte/70">
          {range}
          {startTime ? ` · ${startTime}` : ''}
          {categories.length ? ` · ${categories.join(', ')}` : ''}
        </p>
      </div>
    </li>
  );
}
