import type {SoloStatsGuess, Stats, StatsGuess, TeamStatsGuess} from "@/router/country-page/components/Components.ts";
import {GameMode, GeoMode, Time} from "@/Components.ts";
import type {SubdivisionInfo} from "@/router/country-page/components/utils.ts";

interface SubdivisionStatsUnprocessed {
    points: number;
    enemyPoints: number;
    hitCount: number;
    enemyHitCount: number;
    guessTime: number;
    enemyGuessTime: number;
    count: number;
}

export interface SubdivisionStats {
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    hitRate: number;
    enemyHitRate: number;
    averageGuessTime: number;
    averageEnemyGuessTime: number;
    count: number;
}

export interface SubdivisionStatsWrapper {
    stats: SubdivisionFullStats[];
}

export interface SubdivisionFullStats {
    id: string;
    name: string;
    region: string;
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    hitRate: number;
    enemyHitRate: number;
    averageGuessTime: number;
    averageEnemyGuessTime: number;
    count: number;
}

export interface RegionStatsWrapper {
    regionStats: RegionStats[];
}

export interface RegionStats {
    average: SubdivisionFullStats;
    subdivisions: SubdivisionFullStats[];
}

export interface MapInfo {
    name: string;
    selected: boolean;
    count: number;
}

export function getSoloStats(
    statsGuesses: SoloStatsGuess[],
    subdivisions: Map<string, SubdivisionInfo>,
    startTime: Time,
    maps: Map<GameMode, Map<string, MapInfo>>,
    geoMode: GeoMode,
    region?: boolean
) {
    const subdivisionStatsUnprocessed = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionStats = new Map<string, SubdivisionFullStats>();

    for (const statsGuess of statsGuesses.filter((guess) =>
        guess.roundSubdivisionCode &&
        subdivisions.has(guess.roundSubdivisionCode) &&
        guess.geoMode === geoMode &&
        maps.get(GameMode.Solo)!.get(guess.mapId)?.selected))
    {
        if (statsGuess.gameStartTime < startTime) {
            break;
        }

        const roundSubdivisionId = region ? subdivisions.get(statsGuess.roundSubdivisionCode!)!.region : statsGuess.roundSubdivisionCode!;
        const guessSubdivisionId = region ? subdivisions.get(statsGuess.guess.subdivisionCode ?? "")?.region : statsGuess.guess.subdivisionCode ?? "";

        const stats: SubdivisionStatsUnprocessed = {
            points: statsGuess.guess.points + (subdivisionStatsUnprocessed.get(roundSubdivisionId)?.points ?? 0),
            enemyPoints: 0,
            hitCount: Number(guessSubdivisionId === roundSubdivisionId) + (subdivisionStatsUnprocessed.get(roundSubdivisionId)?.hitCount ?? 0),
            enemyHitCount: 0,
            guessTime: statsGuess.guess.time,
            enemyGuessTime: 0,
            count: 1 + (subdivisionStatsUnprocessed.get(roundSubdivisionId)?.count ?? 0)
        };

        subdivisionStatsUnprocessed.set(roundSubdivisionId, stats);
    }

    for (const [subdivision, stats] of subdivisionStatsUnprocessed) {
        const info = subdivisions.get(subdivision);

        const fullStats: SubdivisionFullStats = {
            id: subdivision,
            name: info?.name ?? subdivision,
            region: info?.region ?? "",
            averagePoints: Math.round(stats.points / stats.count),
            averageEnemyPoints: 0,
            averageDamage: Math.round((stats.points - stats.enemyPoints) / stats.count),
            hitRate: Math.round(1000 * stats.hitCount / stats.count) / 10,
            enemyHitRate: 0,
            averageGuessTime: Math.round(stats.guessTime / stats.count),
            averageEnemyGuessTime: 0,
            count: stats.count
        };

        subdivisionStats.set(subdivision, fullStats);
    }

    return subdivisionStats;
}

export function getDuelsStats(
    statsGuesses: StatsGuess[],
    subdivisions: Map<string, SubdivisionInfo>,
    startTime: Time,
    maps: Map<GameMode, Map<string, MapInfo>>,
    gameMode: GameMode,
    geoMode: GeoMode,
    region?: boolean
) {
    const subdivisionStats = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionFullStats>();

    for (const statsGuess of statsGuesses.filter((guess) =>
        guess.roundSubdivisionCode &&
        subdivisions.has(guess.roundSubdivisionCode) &&
        guess.geoMode === geoMode &&
        maps.get(gameMode)!.get(guess.mapId)?.selected))
    {
        if (statsGuess.gameStartTime < startTime) {
            break;
        }

        const roundSubdivisionId = region ? subdivisions.get(statsGuess.roundSubdivisionCode!)!.region : statsGuess.roundSubdivisionCode!;
        const guessSubdivisionId = region ? subdivisions.get(statsGuess.playerGuess?.subdivisionCode ?? "")?.region : statsGuess.playerGuess?.subdivisionCode ?? "";
        const enemyGuessSubdivisionId = region ? subdivisions.get(statsGuess.playerGuess?.subdivisionCode ?? "")?.region : statsGuess.playerGuess?.subdivisionCode ?? "";

        const stats: SubdivisionStatsUnprocessed = {
            points: (statsGuess.playerGuess?.points ?? 0) + (subdivisionStats.get(roundSubdivisionId)?.points ?? 0),
            enemyPoints: (statsGuess.enemyGuess?.points ?? 0) + (subdivisionStats.get(roundSubdivisionId)?.enemyPoints ?? 0),
            hitCount: Number(guessSubdivisionId === roundSubdivisionId) + (subdivisionStats.get(roundSubdivisionId)?.hitCount ?? 0),
            enemyHitCount: Number(enemyGuessSubdivisionId === roundSubdivisionId) + (subdivisionStats.get(roundSubdivisionId)?.enemyHitCount ?? 0),
            guessTime: statsGuess.playerGuess?.time ?? 0,
            enemyGuessTime: statsGuess.enemyGuess?.time ?? 0,
            count: 1 + (subdivisionStats.get(roundSubdivisionId)?.count ?? 0)
        };

        subdivisionStats.set(roundSubdivisionId, stats);
    }

    for (const [subdivision, stats] of subdivisionStats) {
        const info = subdivisions.get(subdivision);

        const advancedStats: SubdivisionFullStats = {
            id: subdivision,
            name: info?.name ?? subdivision,
            region: info?.region ?? "",
            averagePoints: Math.round(stats.points / stats.count),
            averageEnemyPoints: Math.round(stats.enemyPoints / stats.count),
            averageDamage: Math.round((stats.points - stats.enemyPoints) / stats.count),
            hitRate: Math.round(1000 * stats.hitCount / stats.count) / 10,
            enemyHitRate: Math.round(1000 * stats.enemyHitCount / stats.count) / 10,
            averageGuessTime: Math.round(stats.guessTime / stats.count),
            averageEnemyGuessTime: Math.round(stats.enemyGuessTime / stats.count),
            count: stats.count
        };

        subdivisionAdvancedStats.set(subdivision, advancedStats);
    }

    return subdivisionAdvancedStats;
}

export function getTeamDuelsStats(
    teamStatsGuesses: TeamStatsGuess[],
    subdivisions: Map<string, SubdivisionInfo>,
    startTime: Time,
    maps: Map<GameMode, Map<string, MapInfo>>,
    gameMode: GameMode,
    geoMode: GeoMode,
    region?: boolean
) {
    const subdivisionStats = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionFullStats>();

    for (const teamStatsGuess of teamStatsGuesses.filter((guess) =>
        guess.roundSubdivisionCode &&
        subdivisions.has(guess.roundSubdivisionCode) &&
        guess.geoMode === geoMode &&
        maps.get(gameMode)!.get(guess.mapId)?.selected))
    {
        if (teamStatsGuess.gameStartTime < startTime) {
            break;
        }

        const roundSubdivisionId = region ? subdivisions.get(teamStatsGuess.roundSubdivisionCode!)!.region : teamStatsGuess.roundSubdivisionCode!;

        let bestTeamGuess = null;
        let teamSubdivisionHit = false;
        let bestEnemyTeamGuess = null;
        let enemyTeamSubdivisionHit = false;

        for (const teamGuess of teamStatsGuess.teamGuesses) {
            if (!bestTeamGuess) {
                bestTeamGuess = teamGuess;
            } else {
                if (teamGuess.points > bestTeamGuess.points) {
                    bestTeamGuess = teamGuess;
                }
            }

            if (!teamSubdivisionHit) {
                const guessSubdivisionId = region ? subdivisions.get(teamGuess.subdivisionCode ?? "")?.region : teamGuess.subdivisionCode ?? "";
                teamSubdivisionHit = guessSubdivisionId === roundSubdivisionId;
            }
        }

        for (const teamGuess of teamStatsGuess.enemyTeamGuesses) {
            if (!bestEnemyTeamGuess) {
                bestEnemyTeamGuess = teamGuess;
            } else {
                if (teamGuess.points > bestEnemyTeamGuess.points) {
                    bestEnemyTeamGuess = teamGuess;
                }
            }

            if (!enemyTeamSubdivisionHit) {
                const guessSubdivisionId = region ? subdivisions.get(teamGuess.subdivisionCode ?? "")?.region : teamGuess.subdivisionCode ?? "";
                enemyTeamSubdivisionHit = guessSubdivisionId === roundSubdivisionId;
            }
        }

        const stats: SubdivisionStatsUnprocessed = {
            points: (bestTeamGuess?.points ?? 0) + (subdivisionStats.get(roundSubdivisionId)?.points ?? 0),
            enemyPoints: (bestEnemyTeamGuess?.points ?? 0) + (subdivisionStats.get(roundSubdivisionId)?.enemyPoints ?? 0),
            hitCount: Number(teamSubdivisionHit) + (subdivisionStats.get(roundSubdivisionId)?.hitCount ?? 0),
            enemyHitCount: Number(enemyTeamSubdivisionHit) + (subdivisionStats.get(roundSubdivisionId)?.enemyHitCount ?? 0),
            guessTime: bestTeamGuess?.time ?? 0,
            enemyGuessTime: bestEnemyTeamGuess?.time ?? 0,
            count: 1 + (subdivisionStats.get(roundSubdivisionId)?.count ?? 0)
        };

        subdivisionStats.set(roundSubdivisionId, stats);
    }

    for (const [subdivision, stats] of subdivisionStats) {
        const info = subdivisions.get(subdivision);

        const advancedStats: SubdivisionFullStats = {
            id: subdivision,
            name: info?.name ?? subdivision,
            region: info?.region ?? "",
            averagePoints: Math.round(stats.points / stats.count),
            averageEnemyPoints: Math.round(stats.enemyPoints / stats.count),
            averageDamage: Math.round((stats.points - stats.enemyPoints) / stats.count),
            hitRate: Math.round(1000 * stats.hitCount / stats.count) / 10,
            enemyHitRate: Math.round(1000 * stats.enemyHitCount / stats.count) / 10,
            averageGuessTime: Math.round(stats.guessTime / stats.count),
            averageEnemyGuessTime: Math.round(stats.enemyGuessTime / stats.count),
            count: stats.count
        };

        subdivisionAdvancedStats.set(subdivision, advancedStats);
    }

    return subdivisionAdvancedStats;
}

export function getCountryName(countryCode: string | undefined) {
    const countryNames = new Intl.DisplayNames(["en"], {type: "region"});

    try {
        if (countryCode) {
            return countryNames.of(countryCode.toUpperCase());
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ignored) { /* empty */ }

    return undefined;
}

export function getMaps(stats: Stats, mapsInfo: Map<string, string>, geoMode: GeoMode) {
    const maps = new Map<GameMode, Map<string, MapInfo>>();

    maps.set(GameMode.Solo, getGameModeMaps(stats.solo, mapsInfo, geoMode));
    maps.set(GameMode.Duels, getGameModeMaps(stats.duels, mapsInfo, geoMode));
    maps.set(GameMode.DuelsRanked, getGameModeMaps(stats.duelsRanked, mapsInfo, geoMode));
    maps.set(GameMode.TeamDuels, getGameModeMaps(stats.teamDuels, mapsInfo, geoMode));
    maps.set(GameMode.TeamDuelsRanked, getGameModeMaps(stats.teamDuelsRanked, mapsInfo, geoMode));
    maps.set(GameMode.TeamFun, getGameModeMaps(stats.teamFun, mapsInfo, geoMode));

    return maps;
}

function getGameModeMaps(guesses: SoloStatsGuess[] | StatsGuess[] | TeamStatsGuess[], mapsInfo: Map<string, string>, geoMode: GeoMode) {
    const maps = new Map<string, MapInfo>();

    for (const guess of guesses) {
        if (guess.geoMode !== geoMode || !guess.roundSubdivisionCode) {
            continue;
        }

        maps.set(guess.mapId, {
            name: mapsInfo.get(guess.mapId)!,
            selected: true,
            count: 1 + (maps.get(guess.mapId)?.count ?? 0)
        });
    }

    return maps;
}