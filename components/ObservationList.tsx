import { Fragment } from "react";

import { HorseRow, type MarksByField } from "@/components/HorseRow";
import { MarkSelectorBar } from "@/components/MarkSelectorBar";
import { OBSERVATION_FIELDS, type ObservationField } from "@/lib/observationFields";
import type { WakuColorTokens } from "@/lib/theme";
import type { MarkValue } from "@/types";

export interface HorseListItem {
  horseNo: number;
  wakuColor: WakuColorTokens;
}

interface OpenCell {
  horseNo: number;
  field: ObservationField["key"];
}

interface ObservationListProps {
  horses: HorseListItem[];
  marksByHorseNo: Record<number, MarksByField>;
  openCell: OpenCell | null;
  onOpenField: (horseNo: number, field: ObservationField["key"]) => void;
  onClearField: (horseNo: number, field: ObservationField["key"]) => void;
  onSelectMark: (horseNo: number, field: ObservationField["key"], mark: MarkValue) => void;
}

export function ObservationList({
  horses,
  marksByHorseNo,
  openCell,
  onOpenField,
  onClearField,
  onSelectMark,
}: ObservationListProps) {
  return (
    <div className="rounded-[14px] border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted">
        <span className="w-[30px] shrink-0 text-center">馬番</span>
        <div className="flex flex-1 items-center gap-1.5">
          {OBSERVATION_FIELDS.map((field) => (
            <span key={field.key} className={`text-center ${field.size === "lg" ? "w-12" : "w-11"}`}>
              {field.label}
            </span>
          ))}
        </div>
      </div>

      {horses.map((horse, index) => {
        const isOpen = openCell?.horseNo === horse.horseNo;
        const isLast = index === horses.length - 1;
        const marks = marksByHorseNo[horse.horseNo];

        return (
          <Fragment key={horse.horseNo}>
            <div className={!isLast && !isOpen ? "border-b border-border" : undefined}>
              <HorseRow
                horseNo={horse.horseNo}
                wakuColor={horse.wakuColor}
                marks={marks}
                onOpenField={(field) => onOpenField(horse.horseNo, field)}
                onClearField={(field) => onClearField(horse.horseNo, field)}
              />
            </div>
            {isOpen ? (
              <MarkSelectorBar
                horseNo={horse.horseNo}
                fieldLabel={OBSERVATION_FIELDS.find((f) => f.key === openCell.field)?.label ?? ""}
                currentMark={marks[openCell.field]}
                onSelect={(mark) => onSelectMark(horse.horseNo, openCell.field, mark)}
              />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
