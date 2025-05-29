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
    hitRate: string;
    averagePoints: string;
    relativePoints: string;
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
