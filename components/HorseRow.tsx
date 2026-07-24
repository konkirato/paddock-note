import { ObservationCell } from "@/components/ObservationCell";
import { OBSERVATION_AXES } from "@/types";
import type { Horse, MarkValue, ObservationAxis } from "@/types";

interface HorseRowProps {
  horse: Horse;
  getMark: (axis: ObservationAxis) => MarkValue | undefined;
  onOpenCell: (axis: ObservationAxis) => void;
  onClearCell: (axis: ObservationAxis) => void;
}

export function HorseRow({ horse, getMark, onOpenCell, onClearCell }: HorseRowProps) {
  return (
    <tr className="border-b border-border">
      <td className="px-1 py-2 text-center font-bold">{horse.number}</td>
      <td className="whitespace-nowrap px-1 py-2">{horse.name}</td>
      {OBSERVATION_AXES.map((axis) => (
        <ObservationCell
          key={axis}
          mark={getMark(axis)}
          onOpen={() => onOpenCell(axis)}
          onClear={() => onClearCell(axis)}
        />
      ))}
    </tr>
  );
}
