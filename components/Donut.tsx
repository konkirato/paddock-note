interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}

const RADIUS = 52;
const CENTER = 65;
const STROKE_WIDTH = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Donut({ segments, centerValue, centerLabel }: DonutProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  let offset = 0;

  return (
    <div className="relative h-[130px] w-[130px] shrink-0">
      <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
        {total === 0 ? (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE_WIDTH}
          />
        ) : (
          segments.map((seg) => {
            if (seg.value === 0) return null;
            const length = CIRCUMFERENCE * (seg.value / total);
            const dashOffset = -offset;
            offset += length;
            return (
              <circle
                key={seg.label}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={dashOffset}
              />
            );
          })
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[22px] font-bold tabular-nums text-foreground">{centerValue}</div>
        <div className="text-[10px] text-muted">{centerLabel}</div>
      </div>
    </div>
  );
}
