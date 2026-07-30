import { Fragment } from "react";

import { HorseRow } from "@/components/HorseRow";
import { MarkSelectorBar } from "@/components/MarkSelectorBar";
import { AXIS_LABELS, OBSERVATION_AXES } from "@/types";
import type { Horse, MarkValue, ObservationAxis } from "@/types";

interface OpenCell {
  horseId: string;
  axis: ObservationAxis;
}

interface ObservationTableProps {
  horses: Horse[];
  openCell: OpenCell | null;
  getMark: (horseId: string, axis: ObservationAxis) => MarkValue | undefined;
  onOpenCell: (horseId: string, axis: ObservationAxis) => void;
  onClearCell: (horseId: string, axis: ObservationAxis) => void;
  onSelectMark: (horseId: string, axis: ObservationAxis, mark: MarkValue) => void;
}

const COLUMN_COUNT = 2 + OBSERVATION_AXES.length; // 馬番・馬名 + 4観点

export function ObservationTable({
  horses,
  openCell,
  getMark,
  onOpenCell,
  onClearCell,
  onSelectMark,
}: ObservationTableProps) {
  return (
    <table className="w-full min-w-[380px] border-collapse text-sm">
      <thead>
        <tr className="border-b-2 border-foreground text-left">
          <th className="px-1 py-2 text-center">馬番</th>
          <th className="px-1 py-2">馬名</th>
          {OBSERVATION_AXES.map((axis) => (
            <th key={axis} className="px-1 py-2 text-center">
              {AXIS_LABELS[axis]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {horses.map((horse) => (
          <Fragment key={horse.id}>
            <HorseRow
              horse={horse}
              getMark={(axis) => getMark(horse.id, axis)}
              onOpenCell={(axis) => onOpenCell(horse.id, axis)}
              onClearCell={(axis) => onClearCell(horse.id, axis)}
            />
            {openCell?.horseId === horse.id ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="p-0">
                  <MarkSelectorBar
                    horseName={horse.name}
                    axisLabel={AXIS_LABELS[openCell.axis]}
                    onSelect={(mark) => onSelectMark(horse.id, openCell.axis, mark)}
                  />
                </td>
              </tr>
            ) : null}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
