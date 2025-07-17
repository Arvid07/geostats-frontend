import {GeoMode, type Player} from "@/Components.ts";
import {type HeaderColumn, Key, SortingDirection} from "@/router/country-page/components/utils.ts";

export interface SingleGuess {
    time: number;
    points: number;
    lat: number;
    lon: number;
    countryCode: string | null;
    subdivisionCode: string | null;
}

export interface SoloStatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
    geoMode: GeoMode;
    mapId: string
    guess: SingleGuess;
}

export interface StatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
    geoMode: GeoMode;
    mapId: string;
    playerGuess: SingleGuess | null;
    enemyGuess: SingleGuess | null;
}

export interface TeamStatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
    geoMode: GeoMode;
    mapId: string;
    teamGuesses: SingleGuess[];
    enemyTeamGuesses: SingleGuess[];
}

export interface Stats {
    solo: SoloStatsGuess[];
    duels: StatsGuess[];
    duelsRanked: StatsGuess[];
    teamDuels: TeamStatsGuess[];
    teamDuelsRanked: TeamStatsGuess[];
    teamFun: TeamStatsGuess[];
}

export interface CountryStatsResponse {
    player: Player;
    stats: Stats;
    maps: Record<string, string>
}

export enum Style {
    Subdivision,
    Region,
    Average
}

export function getHeaderColumns() {
    const headerColumns: HeaderColumn[] = [];

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Ascending,
        key: Key.Name
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.HitRate
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.EnemyHitRate
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AveragePoints
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageEnemyPoints
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageDamage
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageGuessTime
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageEnemyGuessTime
    });

    headerColumns.push({
        className: "text-right",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.Count
    });

    return headerColumns;
}

export function getDefaultColumns() {
    const headerColumns = new Set<Key>();

    headerColumns.add(Key.Name);
    headerColumns.add(Key.HitRate);
    headerColumns.add(Key.AveragePoints);
    headerColumns.add(Key.AverageDamage);
    headerColumns.add(Key.Count);

    return headerColumns;
}

export function getDefaultSoloColumns() {
    const headerColumns = new Set<Key>();

    headerColumns.add(Key.Name);
    headerColumns.add(Key.HitRate);
    headerColumns.add(Key.AveragePoints);
    headerColumns.add(Key.AverageGuessTime);
    headerColumns.add(Key.Count);

    return headerColumns;
}

