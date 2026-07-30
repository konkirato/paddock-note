"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { INITIAL_OBSERVATIONS, INITIAL_RACES, INITIAL_RESULTS } from "@/lib/mockData";
import type { ObservationField } from "@/lib/observationFields";
import { getWakuNumber } from "@/lib/waku";
import type {
  FinishPosition,
  MarkValue,
  Observation,
  OddsBand,
  Race,
  Result,
} from "@/types";

interface RaceProgress {
  done: number;
  total: number;
}

export interface RaceSummary {
  primaryHorseNo: number | null; // ◎をつけた馬
  waku: number | null;
  status: "none" | "wait" | "hit" | "miss";
  hitLabel: string | null; // 例: "◎単勝" / "○複勝"
}

export interface FinishBreakdown {
  first: number;
  second: number;
  third: number;
  outOfPlace: number;
  total: number;
}

export interface OddsBandStat {
  band: OddsBand;
  count: number;
  placeCount: number;
  placeRate: number; // 0-100
}

export interface OverallStats {
  observedRaceCount: number; // ◎を1頭以上つけたレース数
  resultedRaceCount: number; // うち結果入力済みのレース数
  winRate: number; // 単勝率 0-100
  placeRate: number; // 複勝率 0-100
  observedHorseCount: number; // 総合に印をつけた頭数の合計
  estimatedReturnRate: number | null; // 概算単勝回収率 0-100、対象レースが無ければnull
}

const ODDS_BANDS: OddsBand[] = ["~2.0", "~5.0", "~10.0", "~20.0", "20.0~"];

// 回収率概算用の代表オッズ(帯の中央値相当)。実オッズが無いモックのための近似値。
const REPRESENTATIVE_ODDS: Record<OddsBand, number> = {
  "~2.0": 1.5,
  "~5.0": 3.5,
  "~10.0": 7.5,
  "~20.0": 15,
  "20.0~": 25,
};

interface StoreContextValue {
  races: Race[];
  getRace: (raceId: string) => Race | undefined;
  addRace: (input: Omit<Race, "id">) => string;

  getMark: (raceId: string, horseNo: number, field: ObservationField["key"]) => MarkValue | null;
  setMark: (
    raceId: string,
    horseNo: number,
    field: ObservationField["key"],
    mark: MarkValue
  ) => void;
  clearMark: (raceId: string, horseNo: number, field: ObservationField["key"]) => void;
  getRaceProgress: (raceId: string) => RaceProgress;
  getObservationsForRace: (raceId: string) => Observation[];

  getResult: (raceId: string, horseNo: number) => Result | undefined;
  setResult: (
    raceId: string,
    horseNo: number,
    finish: FinishPosition,
    oddsBand: OddsBand
  ) => void;

  getRaceSummary: (raceId: string) => RaceSummary;
  getOverallStats: () => OverallStats;
  getFinishBreakdown: () => FinishBreakdown;
  getOddsBandBreakdown: () => OddsBandStat[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

function observationId(raceId: string, horseNo: number) {
  return `${raceId}:${horseNo}`;
}

function resultId(raceId: string, horseNo: number) {
  return `${raceId}:${horseNo}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [races, setRaces] = useState<Race[]>(INITIAL_RACES);
  const [observations, setObservations] = useState<Observation[]>(INITIAL_OBSERVATIONS);
  const [results, setResults] = useState<Result[]>(INITIAL_RESULTS);

  const getRace = useCallback((raceId: string) => races.find((r) => r.id === raceId), [races]);

  const addRace = useCallback((input: Omit<Race, "id">) => {
    const id = `race-${Date.now()}`;
    setRaces((prev) => [...prev, { ...input, id }]);
    return id;
  }, []);

  const getObservationsForRace = useCallback(
    (raceId: string) => observations.filter((o) => o.raceId === raceId),
    [observations]
  );

  const getMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"]) => {
      const record = observations.find((o) => o.id === observationId(raceId, horseNo));
      return record ? record[field] : null;
    },
    [observations]
  );

  const upsertMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"], mark: MarkValue | null) => {
      const race = races.find((r) => r.id === raceId);
      if (!race) return;
      const id = observationId(raceId, horseNo);
      setObservations((prev) => {
        const existing = prev.find((o) => o.id === id);
        if (existing) {
          return prev.map((o) => (o.id === id ? { ...o, [field]: mark } : o));
        }
        const seeded: Observation = {
          id,
          raceId,
          horseNo,
          waku: getWakuNumber(horseNo, race.heads),
          overall: null,
          body: null,
          demeanor: null,
          movement: null,
        };
        return [...prev, { ...seeded, [field]: mark }];
      });
    },
    [races]
  );

  const setMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"], mark: MarkValue) =>
      upsertMark(raceId, horseNo, field, mark),
    [upsertMark]
  );

  const clearMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"]) =>
      upsertMark(raceId, horseNo, field, null),
    [upsertMark]
  );

  const getRaceProgress = useCallback(
    (raceId: string): RaceProgress => {
      const race = races.find((r) => r.id === raceId);
      const total = race?.heads ?? 0;
      const done = observations.filter((o) => o.raceId === raceId && o.overall != null).length;
      return { done, total };
    },
    [races, observations]
  );

  const getResult = useCallback(
    (raceId: string, horseNo: number) => results.find((r) => r.id === resultId(raceId, horseNo)),
    [results]
  );

  const setResult = useCallback(
    (raceId: string, horseNo: number, finish: FinishPosition, oddsBand: OddsBand) => {
      const id = resultId(raceId, horseNo);
      setResults((prev) => {
        const existing = prev.find((r) => r.id === id);
        if (existing) {
          return prev.map((r) => (r.id === id ? { ...r, finish, oddsBand } : r));
        }
        return [...prev, { id, raceId, horseNo, finish, oddsBand }];
      });
    },
    []
  );

  const getRaceSummary = useCallback(
    (raceId: string): RaceSummary => {
      const race = races.find((r) => r.id === raceId);
      const primary = observations.find((o) => o.raceId === raceId && o.overall === "◎");
      if (!race || !primary) {
        return { primaryHorseNo: null, waku: null, status: "none", hitLabel: null };
      }
      const waku = getWakuNumber(primary.horseNo, race.heads);
      const result = results.find(
        (r) => r.raceId === raceId && r.horseNo === primary.horseNo
      );
      if (!result) {
        return { primaryHorseNo: primary.horseNo, waku, status: "wait", hitLabel: null };
      }
      if (result.finish === "1着") {
        return { primaryHorseNo: primary.horseNo, waku, status: "hit", hitLabel: "◎単勝" };
      }
      if (result.finish === "2着" || result.finish === "3着") {
        return { primaryHorseNo: primary.horseNo, waku, status: "hit", hitLabel: "○複勝" };
      }
      return { primaryHorseNo: primary.horseNo, waku, status: "miss", hitLabel: null };
    },
    [races, observations, results]
  );

  // ◎をつけた馬のうち、結果が入力済みのものだけを集計対象にする。
  const getPrimaryPicksWithResults = useCallback(() => {
    return races
      .map((race) => {
        const primary = observations.find((o) => o.raceId === race.id && o.overall === "◎");
        if (!primary) return null;
        const result = results.find(
          (r) => r.raceId === race.id && r.horseNo === primary.horseNo
        );
        if (!result) return null;
        return { race, result };
      })
      .filter((v): v is { race: Race; result: Result } => v !== null);
  }, [races, observations, results]);

  const getOverallStats = useCallback((): OverallStats => {
    const observedRaceCount = races.filter((race) =>
      observations.some((o) => o.raceId === race.id && o.overall === "◎")
    ).length;
    const picks = getPrimaryPicksWithResults();
    const resultedRaceCount = picks.length;
    const winCount = picks.filter((p) => p.result.finish === "1着").length;
    const placeCount = picks.filter((p) =>
      ["1着", "2着", "3着"].includes(p.result.finish)
    ).length;
    const observedHorseCount = observations.filter((o) => o.overall != null).length;

    const estimatedReturnRate =
      resultedRaceCount === 0
        ? null
        : (picks.reduce((sum, p) => {
            if (p.result.finish !== "1着") return sum;
            return sum + REPRESENTATIVE_ODDS[p.result.oddsBand] * 100;
          }, 0) /
            (resultedRaceCount * 100)) *
          100;

    return {
      observedRaceCount,
      resultedRaceCount,
      winRate: resultedRaceCount === 0 ? 0 : (winCount / resultedRaceCount) * 100,
      placeRate: resultedRaceCount === 0 ? 0 : (placeCount / resultedRaceCount) * 100,
      observedHorseCount,
      estimatedReturnRate,
    };
  }, [races, observations, getPrimaryPicksWithResults]);

  const getFinishBreakdown = useCallback((): FinishBreakdown => {
    const picks = getPrimaryPicksWithResults();
    return {
      first: picks.filter((p) => p.result.finish === "1着").length,
      second: picks.filter((p) => p.result.finish === "2着").length,
      third: picks.filter((p) => p.result.finish === "3着").length,
      outOfPlace: picks.filter((p) => p.result.finish === "着外").length,
      total: picks.length,
    };
  }, [getPrimaryPicksWithResults]);

  const getOddsBandBreakdown = useCallback((): OddsBandStat[] => {
    const picks = getPrimaryPicksWithResults();
    return ODDS_BANDS.map((band) => {
      const inBand = picks.filter((p) => p.result.oddsBand === band);
      const placeCount = inBand.filter((p) =>
        ["1着", "2着", "3着"].includes(p.result.finish)
      ).length;
      return {
        band,
        count: inBand.length,
        placeCount,
        placeRate: inBand.length === 0 ? 0 : (placeCount / inBand.length) * 100,
      };
    });
  }, [getPrimaryPicksWithResults]);

  const value = useMemo<StoreContextValue>(
    () => ({
      races,
      getRace,
      addRace,
      getMark,
      setMark,
      clearMark,
      getRaceProgress,
      getObservationsForRace,
      getResult,
      setResult,
      getRaceSummary,
      getOverallStats,
      getFinishBreakdown,
      getOddsBandBreakdown,
    }),
    [
      races,
      getRace,
      addRace,
      getMark,
      setMark,
      clearMark,
      getRaceProgress,
      getObservationsForRace,
      getResult,
      setResult,
      getRaceSummary,
      getOverallStats,
      getFinishBreakdown,
      getOddsBandBreakdown,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
