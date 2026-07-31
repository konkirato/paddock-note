import { getWakuNumber } from "@/lib/waku";
import type { Observation, Race, Result } from "@/types";

export interface RaceRow {
  id: string;
  track: string;
  date: string;
  race_no: number;
  heads: number;
}

export interface ObservationRow {
  id: string;
  race_id: string;
  horse_no: number;
  overall: Observation["overall"];
  body: Observation["body"];
  demeanor: Observation["demeanor"];
  movement: Observation["movement"];
  memo: string | null;
}

export interface ResultRow {
  id: string;
  race_id: string;
  horse_no: number;
  finish: Result["finish"];
  odds_band: Result["oddsBand"];
}

export function raceFromRow(row: RaceRow): Race {
  return {
    id: row.id,
    track: row.track,
    date: row.date,
    raceNo: row.race_no,
    heads: row.heads,
  };
}

export function raceToRow(race: Race): RaceRow {
  return {
    id: race.id,
    track: race.track,
    date: race.date,
    race_no: race.raceNo,
    heads: race.heads,
  };
}

export function observationFromRow(row: ObservationRow, heads: number): Observation {
  return {
    id: row.id,
    raceId: row.race_id,
    horseNo: row.horse_no,
    waku: getWakuNumber(row.horse_no, heads),
    overall: row.overall,
    body: row.body,
    demeanor: row.demeanor,
    movement: row.movement,
    memo: row.memo ?? undefined,
  };
}

export function observationToRow(observation: Observation): ObservationRow {
  return {
    id: observation.id,
    race_id: observation.raceId,
    horse_no: observation.horseNo,
    overall: observation.overall,
    body: observation.body,
    demeanor: observation.demeanor,
    movement: observation.movement,
    memo: observation.memo ?? null,
  };
}

export function resultFromRow(row: ResultRow): Result {
  return {
    id: row.id,
    raceId: row.race_id,
    horseNo: row.horse_no,
    finish: row.finish,
    oddsBand: row.odds_band,
  };
}

export function resultToRow(result: Result): ResultRow {
  return {
    id: result.id,
    race_id: result.raceId,
    horse_no: result.horseNo,
    finish: result.finish,
    odds_band: result.oddsBand,
  };
}
