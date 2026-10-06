/* eslint-disable @next/next/no-img-element -- images are pre-optimised WebP in /public/media */
type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };

export function Photo({ alt, ...rest }: Props) {
  return <img alt={alt} loading="lazy" decoding="async" {...rest} />;
}
