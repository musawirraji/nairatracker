'use client';

interface Slice { value: number; color: string; }
interface Props { slices: Slice[]; size?: number; }

export function DonutChart({ slices, size = 110 }: Props) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />;

  const R = 40, cx = 60, cy = 60, sw = 13, circ = 2 * Math.PI * R;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      {slices.map((s, i) => {
        const pct = s.value / total, dash = pct * circ, gap = (1 - pct) * circ, off = offset;
        offset += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-off * circ}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        );
      })}
    </svg>
  );
}
