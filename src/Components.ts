import {getMonday} from "@/utils.tsx";

export interface Player {
    id: string;
    name: string;
    countryCode: string;
    avatarPin: string;
    level: number;
    isProUser: boolean;
    isCreator: boolean;
    rating?: number | null;
    movingRating?: number | null;
    noMoveRating?: number | null;
    nmpzRating?: number | null;
}

export enum DataFormat {
    Absolute = "Absolute",
    Damage = "Damage",
    Country = "Country"
}

export enum GameMode {
    Solo = "Solo",
    Duels = "Duels",
    DuelsRanked = "DuelsRanked",
    TeamDuels = "TeamDuels",
    TeamDuelsRanked = "TeamDuelsRanked",
    TeamFun = "TeamFun"
}

export enum GeoMode {
    Moving = "Moving",
    NoMove = "NoMove",
    NMPZ = "NMPZ"
}

export enum Time {
    AllTime = 0,
    ThisWeek = getMonday(),
    Last7Days = new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
    Last30Days = new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
    LastYear = new Date().getTime() - 365 * 24 * 60 * 60 * 1000,
    Custom = -1
}

export interface StatsResponse {
    stats: Stats | null;
    enemyStats: Stats | null;
    player: Player;
}

export interface Stats {
    duels: StatsGuess[];
    duelsRanked: StatsGuess[];
    teamDuels: StatsGuess[];
    teamDuelsRanked: StatsGuess[];
    teamFun: StatsGuess[];
}

export interface CountryStats {
    count: number;
    points: number;
}

export interface CountryAdvancedStats {
    countryCode: string;
    countryName: string;
    continent: string;
    hitRate: number;
    enemyHitRate: number;
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    count: number;
}

export interface AverageStats {
    hitRate: number;
    enemyHitRate: number;
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    averageGuessTime: number;
    averageEnemyGuessTime: number;
    count: number;
}

export interface PlayerStats {
    stats: Stats;
    enemyStats: Stats;
}

export interface MapData {
    stats: Map<string, CountryStats>;
    enemyStats: Map<string, CountryStats>;
}

export interface StatsGuess {
    time: number;
    roundCountryCode: string;
    guessCountryCode: string;
    points: number;
}

export interface Country {
    continent: string,
    id: string
}
