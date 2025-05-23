import type {Player} from "@/router/ContainerPage.tsx";

export enum DataFormat {
    Absolute = "Absolute",
    RelativeEnemy = "RelativeEnemy",
    RelativeCountry = "RelativeCountry"
}

export enum TeamGameMode {
    Duels = "Duels",
    DuelsRanked = "DuelsRanked",
    TeamDuels = "TeamDuels",
    TeamDuelsRanked = "TeamDuelsRanked",
    TeamFun = "TeamFun",
    Ranked = "Ranked"
}

export enum Time {
    AllTime = "AllTime",
    ThisWeek = "ThisWeek",
    Last7Days = "Last7Days",
    Last30Days = "Last30Days",
    LastYear = "LastYear",
    Custom = "Custom"
}

export interface HomePageResponse {
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
    points: number;
    countryCode: string;
}
