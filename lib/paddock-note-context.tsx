"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { INITIAL_HORSES, INITIAL_OBSERVATIONS, INITIAL_RACES, INITIAL_RESULTS } from "@/lib/mockData";
import {
  REQUIRED_AXIS,
  type Horse,
  type MarkValue,
  type ObservationAxis,
  type ObservationRecord,
  type Race,
  type ResultRecord,
} from "@/types";

interface RaceProgress {
  done: number;
  total: number;
}

interface PaddockNoteContextValue {
  races: Race[];
  getRace: (raceId: string) => Race | undefined;
  getHorsesForRace: (raceId: string) => Horse[];

  getObservationMark: (
    raceId: string,
    horseId: string,
    axis: ObservationAxis
  ) => MarkValue | undefined;
  setObservationMark: (
    raceId: string,
    horseId: string,
    axis: ObservationAxis,
    mark: MarkValue
  ) => void;
  clearObservationMark: (raceId: string, horseId: string, axis: ObservationAxis) => void;

  getRaceProgress: (raceId: string) => RaceProgress;
  isRaceFilled: (raceId: string) => boolean;

  getResult: (raceId: string, horseId: string) => number | undefined;
  setResult: (raceId: string, horseId: string, finishPosition: number) => void;
}

const PaddockNoteContext = createContext<PaddockNoteContextValue | null>(null);

function observationKey(raceId: string, horseId: string, axis: ObservationAxis) {
  return `${raceId}:${horseId}:${axis}`;
}

export function PaddockNoteProvider({ children }: { children: ReactNode }) {
  const [races] = useState<Race[]>(INITIAL_RACES);
  const [horses] = useState<Horse[]>(INITIAL_HORSES);
  const [observations, setObservations] = useState<ObservationRecord[]>(INITIAL_OBSERVATIONS);
  const [results, setResults] = useState<ResultRecord[]>(INITIAL_RESULTS);

  const getRace = useCallback(
    (raceId: string) => races.find((race) => race.id === raceId),
    [races]
  );

  const getHorsesForRace = useCallback(
    (raceId: string) => horses.filter((horse) => horse.raceId === raceId),
    [horses]
  );

  const getObservationMark = useCallback(
    (raceId: string, horseId: string, axis: ObservationAxis) => {
      const key = observationKey(raceId, horseId, axis);
      return observations.find((record) => record.id === key)?.mark;
    },
    [observations]
  );

  const setObservationMark = useCallback(
    (raceId: string, horseId: string, axis: ObservationAxis, mark: MarkValue) => {
      const key = observationKey(raceId, horseId, axis);
      const now = new Date().toISOString();
      setObservations((prev) => {
        const existing = prev.find((record) => record.id === key);
        if (existing) {
          return prev.map((record) =>
            record.id === key ? { ...record, mark, updatedAt: now } : record
          );
        }
        return [
          ...prev,
          { id: key, raceId, horseId, axis, mark, createdAt: now, updatedAt: now },
        ];
      });
    },
    []
  );

  const clearObservationMark = useCallback(
    (raceId: string, horseId: string, axis: ObservationAxis) => {
      const key = observationKey(raceId, horseId, axis);
      setObservations((prev) => prev.filter((record) => record.id !== key));
    },
    []
  );

  const getRaceProgress = useCallback(
    (raceId: string): RaceProgress => {
      const total = horses.filter((horse) => horse.raceId === raceId).length;
      const done = observations.filter(
        (record) => record.raceId === raceId && record.axis === REQUIRED_AXIS
      ).length;
      return { done, total };
    },
    [horses, observations]
  );

  const isRaceFilled = useCallback(
    (raceId: string) => {
      const { done, total } = getRaceProgress(raceId);
      return total > 0 && done === total;
    },
    [getRaceProgress]
  );

  const getResult = useCallback(
    (raceId: string, horseId: string) => {
      const key = `${raceId}:${horseId}`;
      return results.find((record) => record.id === key)?.finishPosition;
    },
    [results]
  );

  const setResult = useCallback((raceId: string, horseId: string, finishPosition: number) => {
    const key = `${raceId}:${horseId}`;
    const now = new Date().toISOString();
    setResults((prev) => {
      const existing = prev.find((record) => record.id === key);
      if (existing) {
        return prev.map((record) =>
          record.id === key ? { ...record, finishPosition, updatedAt: now } : record
        );
      }
      return [...prev, { id: key, raceId, horseId, finishPosition, updatedAt: now }];
    });
  }, []);

  const value = useMemo<PaddockNoteContextValue>(
    () => ({
      races,
      getRace,
      getHorsesForRace,
      getObservationMark,
      setObservationMark,
      clearObservationMark,
      getRaceProgress,
      isRaceFilled,
      getResult,
      setResult,
    }),
    [
      races,
      getRace,
      getHorsesForRace,
      getObservationMark,
      setObservationMark,
      clearObservationMark,
      getRaceProgress,
      isRaceFilled,
      getResult,
      setResult,
    ]
  );

  return <PaddockNoteContext.Provider value={value}>{children}</PaddockNoteContext.Provider>;
}

export function usePaddockNote(): PaddockNoteContextValue {
  const context = useContext(PaddockNoteContext);
  if (!context) {
    throw new Error("usePaddockNote must be used within a PaddockNoteProvider");
  }
  return context;
}
