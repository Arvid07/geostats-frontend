import {type AverageStats, Time} from "@/Components.ts";
import {AVERAGE_STATS_ID, NO_DATA} from "@/router/country-page/components/DataTable.tsx";
import type {SubdivisionAdvancedStatsWithId} from "@/router/country-page/utils.ts";
import type {SingleGuess, StatsGuess, TeamStatsGuess} from "@/router/country-page/components/Components.ts";

export enum Key {
    Name = "Name",
    Region = "Region",
    HitRate = "Hit Rate",
    EnemyHitRate = "Enemy Hit Rate",
    AveragePoints = "Avg. Points",
    AverageEnemyPoints = "Avg. Enemy Points",
    AverageDamage = "Avg. Damage",
    Count = "Count"
}

export enum SortingDirection {
    Ascending = 1,
    Descending = -1
}

export interface HeaderColumn {
    key: Key,
    defaultSortingDirection: SortingDirection,
    className: string
}

export interface SubdivisionInfo {
    name: string;
    region: string;
}

export interface IndividualSubdivisionStats {
    points: number;
    hitCount: number;
    count: number;
}

interface GameStats {
    stats: SubdivisionAdvancedStatsWithId[];
    enemyStats: SubdivisionAdvancedStatsWithId[];
}

function getSubdivisionStats(rawData: StatsGuess[] | TeamStatsGuess[], startTime: Time) {
    const stats = new Map<string, IndividualSubdivisionStats>();
    const enemyStats = new Map<string, IndividualSubdivisionStats>();

    const statsAverage: IndividualSubdivisionStats = {
        points: 0,
        hitCount: 0,
        count: 0
    };

    stats.set(AVERAGE_STATS_ID, statsAverage);
    enemyStats.set(AVERAGE_STATS_ID, statsAverage);

    for (const guess of rawData) {
        if (guess.gameStartTime < startTime) {
            return [stats, enemyStats];
        }

        if (!guess.roundSubdivisionCode) {
            continue;
        }

        function insertStats(playerGuess: SingleGuess | null, roundSubdivisionCode: string, stats: Map<string, IndividualSubdivisionStats>) {
            if (playerGuess) {
                const countryStats = stats.get(roundSubdivisionCode);
                const averageStats = stats.get(AVERAGE_STATS_ID)!;

                const updatedStatsAverage: IndividualSubdivisionStats = {
                    points: averageStats.points + playerGuess.points,
                    hitCount: averageStats.hitCount + Number(playerGuess.subdivisionCode === roundSubdivisionCode),
                    count: averageStats.count + 1
                };

                stats.set(AVERAGE_STATS_ID, updatedStatsAverage);

                if (countryStats) {
                    const newStats: IndividualSubdivisionStats = {
                        points: countryStats.points + playerGuess.points,
                        hitCount: countryStats.hitCount + Number(playerGuess.subdivisionCode === roundSubdivisionCode),
                        count: countryStats.count + 1
                    };

                    stats.set(roundSubdivisionCode, newStats);
                } else {
                    const startStats: IndividualSubdivisionStats = {
                        points: playerGuess.points,
                        hitCount: Number(playerGuess.subdivisionCode === roundSubdivisionCode),
                        count: 1
                    };

                    stats.set(roundSubdivisionCode, startStats);
                }
            }
        }

        function insertTeamStats(teamGuesses: SingleGuess[], roundSubdivisionCode: string, stats: Map<string, IndividualSubdivisionStats>) {
            if (teamGuesses.length > 0) {
                const countryStats = stats.get(roundSubdivisionCode);
                const averageStats = stats.get(AVERAGE_STATS_ID)!;

                let points = 0;
                let hit = false;

                for (const teamGuess of teamGuesses) {
                    if (teamGuess.points > points) {
                        points = teamGuess.points;
                    }
                    if (teamGuess.subdivisionCode === roundSubdivisionCode) {
                        hit = true;
                    }
                }

                const updatedStatsAverage: IndividualSubdivisionStats = {
                    points: averageStats.points + points,
                    hitCount: averageStats.hitCount + Number(hit),
                    count: averageStats.count + 1
                };

                stats.set(AVERAGE_STATS_ID, updatedStatsAverage);

                if (countryStats) {
                    const newStats: IndividualSubdivisionStats = {
                        points: countryStats.points + points,
                        hitCount: countryStats.hitCount + Number(hit),
                        count: countryStats.count + 1
                    };

                    stats.set(roundSubdivisionCode, newStats);
                } else {
                    const startStats: IndividualSubdivisionStats = {
                        points: points,
                        hitCount: Number(hit),
                        count: 1
                    };

                    stats.set(roundSubdivisionCode, startStats);
                }
            }
        }

        if ("playerGuess" in guess) {
            insertStats(guess.playerGuess, guess.roundSubdivisionCode, stats);
            insertStats(guess.enemyGuess, guess.roundSubdivisionCode, enemyStats);
        } else {
            insertTeamStats(guess.teamGuesses, guess.roundSubdivisionCode, stats);
            insertTeamStats(guess.enemyTeamGuesses, guess.roundSubdivisionCode, enemyStats);
        }
    }

    return [stats, enemyStats];
}

function getSubdivisionAdvancedStats(
    subdivisionId: string,
    name: string,
    region: string,
    countryStats: IndividualSubdivisionStats | undefined,
    enemyCountryStats: IndividualSubdivisionStats | undefined
) {
    if (countryStats?.count || 0 > 0) {
        const countryAdvancedStats: SubdivisionAdvancedStatsWithId = {
            id: subdivisionId,
            name: name,
            region: region,
            averagePoints: Math.round((countryStats?.points || 0) / (countryStats?.count || 1)),
            averageEnemyPoints: Math.round((enemyCountryStats?.points || 0) / (enemyCountryStats?.count || 1)),
            hitRate: Math.round((countryStats?.hitCount || 0) / (countryStats?.count || 1) * 1000) / 10,
            enemyHitRate: Math.round((enemyCountryStats?.hitCount || 0) / (enemyCountryStats?.count || 1) * 1000) / 10,
            averageDamage: Math.round((countryStats?.points || 0) / (countryStats?.count || 1) - (enemyCountryStats?.points || 0) / (enemyCountryStats?.count || 1)),
            count: countryStats?.count || 0
        }

        return countryAdvancedStats;
    } else {
        const countryAdvancedStats: SubdivisionAdvancedStatsWithId = {
            id: subdivisionId,
            name: name,
            region: region,
            averagePoints: NO_DATA,
            averageEnemyPoints: NO_DATA,
            hitRate: NO_DATA,
            enemyHitRate: NO_DATA,
            averageDamage: NO_DATA,
            count: 0
        }

        return countryAdvancedStats;
    }
}

export function getProcessedStats(rawData: StatsGuess[] | TeamStatsGuess[], subdivisions: Map<string, SubdivisionInfo>, time: Time) {
    return getGameStats(getSubdivisionStats(rawData, time), subdivisions);
}

function getGameStats([playerIndividualStats, enemyIndividualStats]: Map<string, IndividualSubdivisionStats>[], subdivisions: Map<string, SubdivisionInfo>) {
    const stats: SubdivisionAdvancedStatsWithId[] = [];
    const enemyStats: SubdivisionAdvancedStatsWithId[] = [];

    for (const [id, info] of subdivisions) {
        const playerCountryStats = playerIndividualStats.get(id);
        const enemyCountryStats = enemyIndividualStats.get(id);

        stats.push(getSubdivisionAdvancedStats(
            id,
            info.name,
            info.region,
            playerCountryStats,
            enemyCountryStats
        ));

        enemyStats.push(getSubdivisionAdvancedStats(
            id,
            info.name,
            info.region,
            enemyCountryStats,
            playerCountryStats
        ));
    }

    const gameStats: GameStats = {
        stats: stats,
        enemyStats: enemyStats
    }

    return gameStats;
}

export function getAverageStats(playerStats: SubdivisionAdvancedStatsWithId[], enemyStats: SubdivisionAdvancedStatsWithId[]) {
    let hitRate = 0;
    let enemyHitRate = 0;
    let points = 0;
    let enemyPoints = 0;
    let damage = 0;
    let count = 0;

    for (let i = 0; i < playerStats.length; i++) {
        hitRate += playerStats[i].hitRate !== NO_DATA ? playerStats[i].hitRate * playerStats[i].count : 0;
        enemyHitRate += enemyStats[i].hitRate !== NO_DATA ? enemyStats[i].hitRate * enemyStats[i].count : 0;
        points += playerStats[i].averagePoints !== NO_DATA ? playerStats[i].averagePoints * playerStats[i].count : 0;
        enemyPoints += enemyStats[i].averagePoints !== NO_DATA ? enemyStats[i].averagePoints * enemyStats[i].count : 0;
        damage += playerStats[i].averageDamage !== NO_DATA ? playerStats[i].averageDamage * playerStats[i].count : 0;
        count += playerStats[i].count !== NO_DATA ? playerStats[i].count : 0;
    }

    const averageStats: AverageStats = {
        hitRate: Math.round(10 * hitRate / count) / 10,
        enemyHitRate: Math.round(10 * enemyHitRate / count) / 10,
        averagePoints: Math.round(points / count),
        averageEnemyPoints: Math.round(enemyPoints / count),
        averageDamage: Math.round(damage / count),
        count: count
    };

    return averageStats;
}

export function sortSubdivisionStats(countryStats: SubdivisionAdvancedStatsWithId[], sortedBy: Key, sortingDirection: SortingDirection) {
    switch (sortedBy) {
        case Key.Name:
            countryStats.sort((a, b) => a.name.localeCompare(b.name) * sortingDirection);
            break;
        case Key.HitRate:
            countryStats.sort((a, b) => a.hitRate !== NO_DATA ? (a.hitRate - b.hitRate) * sortingDirection : 1);
            break;
        case Key.EnemyHitRate:
            countryStats.sort((a, b) => a.enemyHitRate !== NO_DATA ? (a.enemyHitRate - b.enemyHitRate) * sortingDirection : 1);
            break;
        case Key.AveragePoints:
            countryStats.sort((a, b) => a.averagePoints !== NO_DATA ? (a.averagePoints - b.averagePoints) * sortingDirection : 1);
            break;
        case Key.AverageEnemyPoints:
            countryStats.sort((a, b) => a.averageEnemyPoints !== NO_DATA ? (a.averageEnemyPoints - b.averageEnemyPoints) * sortingDirection : 1);
            break;
        case Key.AverageDamage:
            countryStats.sort((a, b) => a.averageDamage !== NO_DATA ? (a.averageDamage - b.averageDamage) * sortingDirection : 1);
            break;
        case Key.Count:
            countryStats.sort((a, b) => (a.count - b.count) * sortingDirection);
            break;
    }
}