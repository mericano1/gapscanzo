import { Ridge } from './Ridge';

// Page header: the section photo first (as on the old site), then the title.
// The old banners are only 980px wide, so on desktop the photo sits in the content column rather than full-bleed.
export function PageHeading({ title, lead, image }: { title: string; lead?: string; image?: string }) {
  if (!image) {
    return (
      <div className="bg-neve">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
          {lead && <p className="mt-3 max-w-2xl text-lg text-notte/80">{lead}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-b from-neve to-white">
      <div className="mx-auto max-w-6xl sm:px-4 sm:pt-6">
        <div className="relative overflow-hidden sm:rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="aspect-[2.8/1] min-h-44 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-notte/75 via-notte/10 to-transparent" />
          <Ridge className="absolute inset-x-0 -bottom-px h-6 w-full text-white sm:h-8" />
          <h1 className="absolute bottom-7 left-4 right-4 text-3xl font-extrabold text-white drop-shadow sm:bottom-10 sm:left-8 sm:text-5xl">
            {title}
          </h1>
        </div>
        {lead && <p className="max-w-2xl px-4 pt-5 text-lg text-notte/80 sm:px-0">{lead}</p>}
      </div>
    </div>
  );
}
