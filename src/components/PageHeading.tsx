export function PageHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="bg-neve">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-lg text-notte/80">{lead}</p>}
      </div>
    </div>
  );
}
