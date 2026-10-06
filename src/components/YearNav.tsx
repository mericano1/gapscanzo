import { Link } from '@/i18n/navigation';

export function YearNav({ years, current }: { years: [string, number][]; current?: string }) {
  return (
    <nav aria-label="Archivio per anno" className="flex flex-wrap gap-2">
      {years.map(([y, n]) => (
        <Link
          key={y}
          href={`/blog/anno/${y}`}
          aria-current={y === current ? 'page' : undefined}
          className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${y === current ? 'border-notte bg-notte text-white' : 'border-roccia/30 text-roccia hover:border-roccia'}`}
        >
          {y} <span className="font-normal opacity-70">({n})</span>
        </Link>
      ))}
    </nav>
  );
}
