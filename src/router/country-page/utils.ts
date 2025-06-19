import type {StatsGuess, TeamStatsGuess} from "@/router/country-page/components/Components.ts";
import {Time} from "@/Components.ts";
import type {SubdivisionInfo} from "@/router/country-page/components/utils.ts";

interface SubdivisionStats {
    points: number;
    enemyPoints: number;
    hitCount: number;
    enemyHitCount: number;
    count: number;
}

export interface SubdivisionAdvancedStats {
    averagePoints: number;
    averageEnemyPoints: number;
    averageDamage: number;
    hitRate: number;
    enemyHitRate: number;
    count: number;
}

export interface SubdivisionAdvancedStatsWithId {
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

export function getDuelsStats(statsGuesses: StatsGuess[], subdivisions: Map<string, SubdivisionInfo>, startTime: Time) {
    const subdivisionStats = new Map<string, SubdivisionStats>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionAdvancedStats>();

    for (const statsGuess of statsGuesses.filter((guess) => guess.roundSubdivisionCode && subdivisions.has(guess.roundSubdivisionCode))) {
        if (statsGuess.gameStartTime < startTime) {
            break;
        }

        const stats: SubdivisionStats = {
            points: (statsGuess.playerGuess?.points ?? 0) + (subdivisionStats.get(statsGuess.roundSubdivisionCode!)?.points ?? 0),
            enemyPoints: (statsGuess.enemyGuess?.points ?? 0) + (subdivisionStats.get(statsGuess.roundSubdivisionCode!)?.enemyPoints ?? 0),
            hitCount: Number(statsGuess.playerGuess?.subdivisionCode === statsGuess.roundSubdivisionCode) + (subdivisionStats.get(statsGuess.roundSubdivisionCode!)?.hitCount ?? 0),
            enemyHitCount: Number(statsGuess.enemyGuess?.subdivisionCode === statsGuess.roundSubdivisionCode) + (subdivisionStats.get(statsGuess.roundSubdivisionCode!)?.enemyPoints ?? 0),
            count: 1 + (subdivisionStats.get(statsGuess.roundSubdivisionCode!)?.count ?? 0)
        };

        subdivisionStats.set(statsGuess.roundSubdivisionCode!, stats);
    }

    for (const [subdivision, stats] of subdivisionStats) {
        const advancedStats: SubdivisionAdvancedStats = {
            averagePoints: Math.round(stats.points / stats.count),
            averageEnemyPoints: Math.round(stats.enemyPoints / stats.count),
            averageDamage: Math.round((stats.points - stats.enemyPoints) / stats.count),
            hitRate: Math.round(10 * stats.hitCount / stats.count) / 10,
            enemyHitRate: Math.round(10 * stats.enemyHitCount / stats.count) / 10,
            count: stats.count
        };

        subdivisionAdvancedStats.set(subdivision, advancedStats);
    }

    return subdivisionAdvancedStats;
}

export function getTeamDuelsStats(teamStatsGuesses: TeamStatsGuess[], subdivisions: Map<string, SubdivisionInfo>, startTime: Time) {
    const subdivisionStats = new Map<string, SubdivisionStats>();
    const subdivisionAdvancedStats = new Map<string, SubdivisionAdvancedStats>();

    for (const teamStatsGuess of teamStatsGuesses.filter((guess) => guess.roundSubdivisionCode && subdivisions.has(guess.roundSubdivisionCode))) {
        if (teamStatsGuess.gameStartTime < startTime) {
            break;
        }

        let bestTeamGuess = null;
        let bestEnemyTeamGuess = null;

        for (const teamGuess of teamStatsGuess.teamGuesses) {
            if (!bestTeamGuess) {
                bestTeamGuess = teamGuess;
            } else {
                if (teamGuess.points > bestTeamGuess.points) {
                    bestTeamGuess = teamGuess;
                }
            }
        }

        for (const teamGuess of teamStatsGuess.enemyTeamGuesses) {
            if (!bestTeamGuess) {
                bestEnemyTeamGuess = teamGuess;
            } else {
                if (teamGuess.points > bestTeamGuess.points) {
                    bestEnemyTeamGuess = teamGuess;
                }
            }
        }

        const stats: SubdivisionStats = {
            points: (bestTeamGuess?.points ?? 0) + (subdivisionStats.get(teamStatsGuess.roundSubdivisionCode!)?.points ?? 0),
            enemyPoints: (bestEnemyTeamGuess?.points ?? 0) + (subdivisionStats.get(teamStatsGuess.roundSubdivisionCode!)?.enemyPoints ?? 0),
            hitCount: Number(bestTeamGuess?.subdivisionCode === teamStatsGuess.roundSubdivisionCode) + (subdivisionStats.get(teamStatsGuess.roundSubdivisionCode!)?.hitCount ?? 0),
            enemyHitCount: Number(bestEnemyTeamGuess?.subdivisionCode === teamStatsGuess.roundSubdivisionCode) + (subdivisionStats.get(teamStatsGuess.roundSubdivisionCode!)?.enemyPoints ?? 0),
            count: 1 + (subdivisionStats.get(teamStatsGuess.roundSubdivisionCode!)?.count ?? 0)
        };

        subdivisionStats.set(teamStatsGuess.roundSubdivisionCode!, stats);
    }

    for (const [region, stats] of subdivisionStats) {
        const advancedStats: SubdivisionAdvancedStats = {
            averagePoints: Math.round(stats.points / stats.count),
            averageEnemyPoints: Math.round(stats.enemyPoints / stats.count),
            averageDamage: Math.round((stats.points - stats.enemyPoints) / stats.count),
            hitRate: Math.round(10 * stats.hitCount / stats.count) / 10,
            enemyHitRate: Math.round(10 * stats.enemyHitCount / stats.count) / 10,
            count: stats.count
        };

        subdivisionAdvancedStats.set(region, advancedStats);
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
