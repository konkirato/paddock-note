import { ObservationCell } from "@/components/ObservationCell";
import { OBSERVATION_FIELDS, type ObservationField } from "@/lib/observationFields";
import type { WakuColorTokens } from "@/lib/theme";
import type { MarkValue } from "@/types";

export type MarksByField = Record<ObservationField["key"], MarkValue | null>;

interface HorseRowProps {
  horseNo: number;
  wakuColor: WakuColorTokens;
  marks: MarksByField;
  onOpenField: (field: ObservationField["key"]) => void;
  onClearField: (field: ObservationField["key"]) => void;
}

const INPUT_FIELDS = OBSERVATION_FIELDS.filter((field) => !field.readOnly);
const OVERALL_FIELD = OBSERVATION_FIELDS.find((field) => field.readOnly)!;

export function HorseRow({ horseNo, wakuColor, marks, onOpenField, onClearField }: HorseRowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md text-sm font-bold"
        style={{
          backgroundColor: wakuColor.bg,
          color: wakuColor.text,
          border: `1px solid ${wakuColor.border}`,
        }}
      >
        {horseNo}
      </div>
      <div className="flex flex-1 items-center gap-1.5">
        {INPUT_FIELDS.map((field) => (
          <ObservationCell
            key={field.key}
            mark={marks[field.key]}
            size={field.size}
            readOnly={field.readOnly}
            onOpen={() => onOpenField(field.key)}
            onClear={() => onClearField(field.key)}
          />
        ))}
      </div>
      <div className="h-9 w-px shrink-0 bg-border" />
      <ObservationCell
        mark={marks[OVERALL_FIELD.key]}
        size={OVERALL_FIELD.size}
        readOnly
        onOpen={() => {}}
        onClear={() => {}}
      />
    </div>
  );
}
