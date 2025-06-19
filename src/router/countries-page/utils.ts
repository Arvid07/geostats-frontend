import {type AverageStats, type CountryAdvancedStats, type StatsGuess, Time} from "@/Components.ts";
import {AVERAGE_STATS_ID, NO_DATA} from "./CountriesPage";

export enum Key {
    Name = "Name",
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

export interface IndividualCountryStats {
    points: number;
    hitCount: number;
    count: number;
}

interface GameStats {
    stats: CountryAdvancedStats[];
    enemyStats: CountryAdvancedStats[];
}

export function getIndividualCountryStats(rawData: StatsGuess[], startTime: Time) {
    const stats = new Map<string, IndividualCountryStats>();

    const statsAverage: IndividualCountryStats = {
        points: 0,
        hitCount: 0,
        count: 0
    };

    stats.set(AVERAGE_STATS_ID, statsAverage);

    for (const guess of rawData) {
        if (guess.time < startTime) {
            return stats;
        }

        const countryStats = stats.get(guess.roundCountryCode);
        const averageStats = stats.get(AVERAGE_STATS_ID)!;

        const updatedStatsAverage: IndividualCountryStats = {
            points: averageStats.points + guess.points,
            hitCount: averageStats.hitCount + Number(guess.guessCountryCode === guess.roundCountryCode),
            count: averageStats.count + 1
        };

        stats.set(AVERAGE_STATS_ID, updatedStatsAverage);

        if (countryStats) {
            const newStats: IndividualCountryStats = {
                points: countryStats.points + guess.points,
                hitCount: countryStats.hitCount + Number(guess.guessCountryCode === guess.roundCountryCode),
                count: countryStats.count + 1
            };

            stats.set(guess.roundCountryCode, newStats);
        } else {
            const startStats: IndividualCountryStats = {
                points: guess.points,
                hitCount: Number(guess.guessCountryCode === guess.roundCountryCode),
                count: 1
            };

            stats.set(guess.roundCountryCode, startStats);
        }
    }

    return stats;
}

function getCountryAdvancedStats(
    countryNames: Intl.DisplayNames,
    countryId: string,
    continent: string,
    countryStats: IndividualCountryStats | undefined,
    enemyCountryStats: IndividualCountryStats | undefined
) {
    if (countryStats?.count || 0 > 0) {
        const countryAdvancedStats: CountryAdvancedStats = {
            countryCode: countryId,
            countryName: countryNames.of(countryId)!,
            continent: continent,
            averagePoints: Math.round((countryStats?.points || 0) / (countryStats?.count || 1)),
            averageEnemyPoints: Math.round((enemyCountryStats?.points || 0) / (enemyCountryStats?.count || 1)),
            hitRate: Math.round((countryStats?.hitCount || 0) / (countryStats?.count || 1) * 1000) / 10,
            enemyHitRate: Math.round((enemyCountryStats?.hitCount || 0) / (enemyCountryStats?.count || 1) * 1000) / 10,
            averageDamage: Math.round((countryStats?.points || 0) / (countryStats?.count || 1) - (enemyCountryStats?.points || 0) / (enemyCountryStats?.count || 1)),
            count: countryStats?.count || 0
        }

        return countryAdvancedStats;
    } else {
        const countryAdvancedStats: CountryAdvancedStats = {
            countryCode: countryId,
            countryName: countryNames.of(countryId)!,
            continent: continent,
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

export function getProcessedStats(
    rawStats: StatsGuess[],
    rawEnemyStats: StatsGuess[],
    countries: Map<string, string>,
    time: Time
) {
    const stats: CountryAdvancedStats[] = [];
    const enemyStats: CountryAdvancedStats[] = [];
    const countryNames = new Intl.DisplayNames(["en"], {type: "region"});

    const playerIndividualStats = getIndividualCountryStats(rawStats, time);
    const enemyIndividualStats = getIndividualCountryStats(rawEnemyStats, time);

    for (const [countryId, continent] of countries) {
        const playerCountryStats = playerIndividualStats.get(countryId);
        const enemyCountryStats = enemyIndividualStats.get(countryId);

        stats.push(getCountryAdvancedStats(
            countryNames,
            countryId,
            continent,
            playerCountryStats,
            enemyCountryStats
        ));

        enemyStats.push(getCountryAdvancedStats(
            countryNames,
            countryId,
            continent,
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

export function getAverageStats(playerStats: CountryAdvancedStats[], enemyStats: CountryAdvancedStats[]) {
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

export function sortCountryStats(countryStats: CountryAdvancedStats[], sortedBy: Key, sortingDirection: SortingDirection) {
    switch (sortedBy) {
        case Key.Name:
            countryStats.sort((a, b) => a.countryName.localeCompare(b.countryName) * sortingDirection);
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