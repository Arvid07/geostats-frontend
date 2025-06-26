import type {SoloStatsGuess, StatsGuess, TeamStatsGuess} from "@/router/country-page/components/Components.ts";
import {Time} from "@/Components.ts";
import type {SubdivisionInfo} from "@/router/country-page/components/utils.ts";

interface SubdivisionStatsUnprocessed {
    points: number;
    enemyPoints: number;
    hitCount: number;
    enemyHitCount: number;
    count: number;
}

export interface SubdivisionStats {
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    hitRate: number;
    enemyHitRate: number;
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
    count: number;
}

export interface RegionStatsWrapper {
    regionStats: RegionStats[];
}

export interface RegionStats {
    average: SubdivisionFullStats;
    subdivisions: SubdivisionFullStats[];
}

export function getSoloStats(statsGuesses: SoloStatsGuess[], subdivisions: Map<string, SubdivisionInfo>, startTime: Time, region?: boolean) {
    const subdivisionStatsUnprocessed = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionStats = new Map<string, SubdivisionFullStats>();

    for (const statsGuess of statsGuesses.filter((guess) => guess.roundSubdivisionCode && subdivisions.has(guess.roundSubdivisionCode))) {
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
            count: stats.count
        };

        subdivisionStats.set(subdivision, fullStats);
    }

    return subdivisionStats;
}

export function getDuelsStats(statsGuesses: StatsGuess[], subdivisions: Map<string, SubdivisionInfo>, startTime: Time, region?: boolean) {
    const subdivisionStats = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionFullStats>();

    for (const statsGuess of statsGuesses.filter((guess) => guess.roundSubdivisionCode && subdivisions.has(guess.roundSubdivisionCode))) {
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
            count: stats.count
        };

        subdivisionAdvancedStats.set(subdivision, advancedStats);
    }

    return subdivisionAdvancedStats;
}

export function getTeamDuelsStats(teamStatsGuesses: TeamStatsGuess[], subdivisions: Map<string, SubdivisionInfo>, startTime: Time, region?: boolean) {
    const subdivisionStats = new Map<string, SubdivisionStatsUnprocessed>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionFullStats>();

    for (const teamStatsGuess of teamStatsGuesses.filter((guess) => guess.roundSubdivisionCode && subdivisions.has(guess.roundSubdivisionCode))) {
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
