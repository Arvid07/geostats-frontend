import type {Player} from "@/Components.ts";

export interface SingleGuess {
    time: number | null;
    points: number;
    lat: number;
    lon: number;
    countryCode: string | null;
    subdivisionCode: string | null;
}

export interface SoloStatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
    guess: SingleGuess;
}

export interface StatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
    playerGuess: SingleGuess | null;
    enemyGuess: SingleGuess | null;
}

export interface TeamStatsGuess {
    gameStartTime: number;
    roundSubdivisionCode: string | null;
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
    stats: Stats | null;
}

export enum Style {
    Subdivision,
    Region,
    Average
}

