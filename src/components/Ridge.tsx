// The faceted skyline from the old GAP header banner, redrawn as SVG.
// Ridge points are the summit line; "base" points sit below and form the triangles between them.
const ridge: [number, number][] = [
  [0, 210], [110, 150], [200, 190], [330, 95], [420, 150], [520, 40], [610, 140], [700, 85],
  [800, 170], [910, 110], [1010, 195], [1120, 130], [1230, 185], [1340, 140], [1440, 175],
];
const base: [number, number][] = ridge.slice(0, -1).map(([x], i) => [(x + ridge[i + 1][0]) / 2, 215 + ((i * 37) % 45)]);
const shades = ['#16b3ea', '#0f9ee0', '#32d0ff', '#0b88d2', '#4bd8ff', '#0a74bd', '#1bbcf2', '#0d93d8'];

const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ');

export function Ridge({ className }: { className?: string }) {
  const tris: { d: string; fill: string }[] = [];
  ridge.slice(0, -1).forEach((r, i) => {
    tris.push({ d: pts(r, ridge[i + 1], base[i]), fill: shades[(i * 3) % shades.length] });
    if (i < base.length - 1) tris.push({ d: pts(base[i], ridge[i + 1], base[i + 1]), fill: shades[(i * 5 + 2) % shades.length] });
  });
  const floor = `M0,${base[0][1]} L${base.map(([x, y]) => `${x},${y}`).join(' L')} L1440,${base.at(-1)![1]} L1440,320 L0,320 Z`;
  return (
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true" className={className}>
      {tris.map((t, i) => (
        <polygon key={i} points={t.d} fill={t.fill} />
      ))}
      <path d={floor} fill="currentColor" />
    </svg>
  );
}
