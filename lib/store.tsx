"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  observationFromRow,
  observationToRow,
  raceFromRow,
  raceToRow,
  resultFromRow,
  resultToRow,
  type ObservationRow,
  type RaceRow,
  type ResultRow,
} from "@/lib/supabase/mappers";
import { createClient } from "@/lib/supabase/client";
import { randomId } from "@/lib/id";
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

// 回収率概算用の代表オッズ(帯の中央値相当)。実オッズが無いための近似値。
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
  // 頭数を減らした場合、範囲外になった馬の観察・結果データは削除する。
  updateRace: (raceId: string, patch: Partial<Omit<Race, "id">>) => void;
  // レース本体と、そのレースの観察・結果データをすべて削除する。
  deleteRace: (raceId: string) => void;

  getMark: (raceId: string, horseNo: number, field: ObservationField["key"]) => MarkValue | null;
  setMark: (
    raceId: string,
    horseNo: number,
    field: ObservationField["key"],
    mark: MarkValue
  ) => void;
  clearMark: (raceId: string, horseNo: number, field: ObservationField["key"]) => void;
  // 複数フィールド(手入力した項目+自動計算した総合など)を1回の更新にまとめて
  // 保存する。同じ馬の行に対して連続でsetMark/clearMarkを呼ぶと、別々の
  // 非同期書き込みが競合してDBの一意制約エラーになることがあるため、
  // 総合の自動再計算はこちらを使う。
  setObservationFields: (
    raceId: string,
    horseNo: number,
    patch: Partial<Pick<Observation, "overall" | "body" | "demeanor" | "movement">>
  ) => void;
  getRaceProgress: (raceId: string) => RaceProgress;
  getObservationsForRace: (raceId: string) => Observation[];

  getResult: (raceId: string, horseNo: number) => Result | undefined;
  setResult: (
    raceId: string,
    horseNo: number,
    finish: FinishPosition,
    oddsBand: OddsBand | null
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
  const supabase = useMemo(() => createClient(), []);
  const [races, setRacesState] = useState<Race[]>([]);
  const [observations, setObservationsState] = useState<Observation[]>([]);
  const [results, setResultsState] = useState<Result[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // React の setState は更新関数を必ず同期的に評価するとは限らないため、
  // 同一イベント内で連続してマークを更新する(総合の自動再計算)場合に前の
  // 更新結果を見落とすことがある。ref に最新値を持たせ、更新関数は常に
  // ref を起点に計算することで、呼び出し直後から確実に最新値を参照できる。
  const racesRef = useRef<Race[]>([]);
  const observationsRef = useRef<Observation[]>([]);
  const resultsRef = useRef<Result[]>([]);

  const setRaces = useCallback((updater: (prev: Race[]) => Race[]) => {
    const next = updater(racesRef.current);
    racesRef.current = next;
    setRacesState(next);
  }, []);

  const setObservations = useCallback((updater: (prev: Observation[]) => Observation[]) => {
    const next = updater(observationsRef.current);
    observationsRef.current = next;
    setObservationsState(next);
  }, []);

  const setResults = useCallback((updater: (prev: Result[]) => Result[]) => {
    const next = updater(resultsRef.current);
    resultsRef.current = next;
    setResultsState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [racesRes, observationsRes, resultsRes] = await Promise.all([
        supabase.from("races").select("*"),
        supabase.from("observations").select("*"),
        supabase.from("results").select("*"),
      ]);
      if (cancelled) return;

      const error = racesRes.error ?? observationsRes.error ?? resultsRes.error;
      if (error) {
        console.error(error);
        setStatus("error");
        return;
      }

      const loadedRaces = ((racesRes.data ?? []) as RaceRow[]).map(raceFromRow);
      const headsByRaceId = new Map(loadedRaces.map((race) => [race.id, race.heads]));
      const loadedObservations = ((observationsRes.data ?? []) as ObservationRow[])
        .filter((row) => headsByRaceId.has(row.race_id))
        .map((row) => observationFromRow(row, headsByRaceId.get(row.race_id)!));
      const loadedResults = ((resultsRes.data ?? []) as ResultRow[]).map(resultFromRow);

      setRaces(() => loadedRaces);
      setObservations(() => loadedObservations);
      setResults(() => loadedResults);
      setStatus("ready");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const getRace = useCallback((raceId: string) => races.find((r) => r.id === raceId), [races]);

  const addRace = useCallback(
    (input: Omit<Race, "id">) => {
      const id = randomId();
      const race: Race = { ...input, id };
      setRaces((prev) => [...prev, race]);
      void supabase
        .from("races")
        .insert(raceToRow(race))
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setRaces((prev) => prev.filter((r) => r.id !== id));
          }
        });
      return id;
    },
    [supabase]
  );

  const updateRace = useCallback(
    (raceId: string, patch: Partial<Omit<Race, "id">>) => {
      const previousRace = races.find((r) => r.id === raceId);
      if (!previousRace) return;
      const nextRace: Race = { ...previousRace, ...patch };

      setRaces((prev) => prev.map((r) => (r.id === raceId ? nextRace : r)));

      void supabase
        .from("races")
        .update(raceToRow(nextRace))
        .eq("id", raceId)
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setRaces((prev) => prev.map((r) => (r.id === raceId ? previousRace : r)));
          }
        });

      // 頭数を減らした場合、範囲外(元の頭数以内だが新しい頭数を超える馬番)の
      // 観察・結果データはローカル/DB双方から削除して整合性を保つ。
      if (nextRace.heads < previousRace.heads) {
        const newHeads = nextRace.heads;
        let removedObservations: Observation[] = [];
        setObservations((prev) => {
          removedObservations = prev.filter((o) => o.raceId === raceId && o.horseNo > newHeads);
          return prev.filter((o) => !(o.raceId === raceId && o.horseNo > newHeads));
        });
        if (removedObservations.length > 0) {
          void supabase
            .from("observations")
            .delete()
            .eq("race_id", raceId)
            .gt("horse_no", newHeads)
            .then(({ error }) => {
              if (error) {
                console.error(error);
                setObservations((prev) => [...prev, ...removedObservations]);
              }
            });
        }

        let removedResults: Result[] = [];
        setResults((prev) => {
          removedResults = prev.filter((r) => r.raceId === raceId && r.horseNo > newHeads);
          return prev.filter((r) => !(r.raceId === raceId && r.horseNo > newHeads));
        });
        if (removedResults.length > 0) {
          void supabase
            .from("results")
            .delete()
            .eq("race_id", raceId)
            .gt("horse_no", newHeads)
            .then(({ error }) => {
              if (error) {
                console.error(error);
                setResults((prev) => [...prev, ...removedResults]);
              }
            });
        }
      }
    },
    [races, supabase]
  );

  const deleteRace = useCallback(
    (raceId: string) => {
      const previousRace = races.find((r) => r.id === raceId);
      if (!previousRace) return;

      // observations/results は races への外部キーに ON DELETE CASCADE が
      // 設定されているため、レース本体をDBから削除すればDB側は自動で消える。
      // ローカル state は自分で取り除く。
      let removedObservations: Observation[] = [];
      setObservations((prev) => {
        removedObservations = prev.filter((o) => o.raceId === raceId);
        return prev.filter((o) => o.raceId !== raceId);
      });

      let removedResults: Result[] = [];
      setResults((prev) => {
        removedResults = prev.filter((r) => r.raceId === raceId);
        return prev.filter((r) => r.raceId !== raceId);
      });

      setRaces((prev) => prev.filter((r) => r.id !== raceId));

      void supabase
        .from("races")
        .delete()
        .eq("id", raceId)
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setRaces((prev) => [...prev, previousRace]);
            setObservations((prev) => [...prev, ...removedObservations]);
            setResults((prev) => [...prev, ...removedResults]);
          }
        });
    },
    [races, supabase]
  );

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

  const setObservationFields = useCallback(
    (
      raceId: string,
      horseNo: number,
      patch: Partial<Pick<Observation, "overall" | "body" | "demeanor" | "movement">>
    ) => {
      const race = races.find((r) => r.id === raceId);
      if (!race) return;
      const id = observationId(raceId, horseNo);

      // previous/next は setObservations の更新関数の中で確定させる。同じ馬に対して
      // 同一イベント内で連続して更新する(総合の自動再計算)ことがあるため、外側の
      // クロージャの observations を直接参照すると、後続の呼び出しが前の呼び出しの
      // 結果を見落として上書き・重複を起こす。また、同じ馬の行への書き込みは
      // 呼び出しごとに別々のリクエストにせず必ず1回のpatchにまとめること。
      // (別々のリクエストにすると非同期の書き込みが競合し、DBの一意制約
      // (race_id, horse_no)エラーになることがある)
      let previous: Observation | undefined;
      let next: Observation;
      setObservations((prev) => {
        previous = prev.find((o) => o.id === id);
        next = previous
          ? { ...previous, ...patch }
          : {
              id,
              raceId,
              horseNo,
              waku: getWakuNumber(horseNo, race.heads),
              overall: null,
              body: null,
              demeanor: null,
              movement: null,
              ...patch,
            };
        return previous ? prev.map((o) => (o.id === id ? next : o)) : [...prev, next];
      });

      void supabase
        .from("observations")
        .upsert(observationToRow(next!), { onConflict: "id" })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setObservations((prev) =>
              previous
                ? prev.map((o) => (o.id === id ? previous! : o))
                : prev.filter((o) => o.id !== id)
            );
          }
        });
    },
    [races, supabase]
  );

  const setMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"], mark: MarkValue) =>
      setObservationFields(raceId, horseNo, { [field]: mark }),
    [setObservationFields]
  );

  const clearMark = useCallback(
    (raceId: string, horseNo: number, field: ObservationField["key"]) =>
      setObservationFields(raceId, horseNo, { [field]: null }),
    [setObservationFields]
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
    (raceId: string, horseNo: number, finish: FinishPosition, oddsBand: OddsBand | null) => {
      const id = resultId(raceId, horseNo);

      let previous: Result | undefined;
      let next: Result;
      setResults((prev) => {
        previous = prev.find((r) => r.id === id);
        next = { id, raceId, horseNo, finish, oddsBand };
        return previous ? prev.map((r) => (r.id === id ? next : r)) : [...prev, next];
      });

      void supabase
        .from("results")
        .upsert(resultToRow(next!), { onConflict: "id" })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setResults((prev) =>
              previous ? prev.map((r) => (r.id === id ? previous! : r)) : prev.filter((r) => r.id !== id)
            );
          }
        });
    },
    [supabase]
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

    // オッズ帯が未入力の結果は回収率の計算対象から除外する(的中率には含める)。
    const picksWithOdds = picks.filter((p) => p.result.oddsBand !== null);
    const estimatedReturnRate =
      picksWithOdds.length === 0
        ? null
        : (picksWithOdds.reduce((sum, p) => {
            if (p.result.finish !== "1着") return sum;
            return sum + REPRESENTATIVE_ODDS[p.result.oddsBand!] * 100;
          }, 0) /
            (picksWithOdds.length * 100)) *
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
      updateRace,
      deleteRace,
      getMark,
      setMark,
      clearMark,
      setObservationFields,
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
      updateRace,
      deleteRace,
      addRace,
      getMark,
      setMark,
      clearMark,
      setObservationFields,
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

  if (status === "loading") {
    return (
      <div className="flex min-h-full items-center justify-center p-6 text-sm text-muted">
        読み込み中...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-full items-center justify-center p-6 text-sm text-muted">
        データの読み込みに失敗しました。再読み込みしてください。
      </div>
    );
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
