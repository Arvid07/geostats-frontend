import {type AverageStats} from "@/Components.ts";
import {NO_DATA} from "@/router/country-page/components/DataTable.tsx";
import type {RegionStats, SubdivisionFullStats} from "@/router/country-page/utils.ts";

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

export function getAverageStats(stats: SubdivisionFullStats[]) {
    let hitRate = 0;
    let enemyHitRate = 0;
    let points = 0;
    let enemyPoints = 0;
    let damage = 0;
    let count = 0;

    for (let i = 0; i < stats.length; i++) {
        hitRate += stats[i].hitRate !== NO_DATA ? stats[i].hitRate * stats[i].count : 0;
        enemyHitRate += stats[i].enemyHitRate !== NO_DATA ? stats[i].enemyHitRate * stats[i].count : 0;
        points += stats[i].averagePoints !== NO_DATA ? stats[i].averagePoints * stats[i].count : 0;
        enemyPoints += stats[i].averageEnemyPoints !== NO_DATA ? stats[i].averageEnemyPoints * stats[i].count : 0;
        damage += stats[i].averageDamage !== NO_DATA ? stats[i].averageDamage * stats[i].count : 0;
        count += stats[i].count !== NO_DATA ? stats[i].count : 0;
    }

    const averageStats: AverageStats = {
        hitRate: count > 0 ? Math.round(10 * hitRate / count) / 10 : NO_DATA,
        enemyHitRate: count > 0 ? Math.round(10 * enemyHitRate / count) / 10 : NO_DATA,
        averagePoints: count > 0 ? Math.round(points / count) : NO_DATA,
        averageEnemyPoints: count > 0 ? Math.round(enemyPoints / count) : NO_DATA,
        averageDamage: count > 0 ? Math.round(damage / count) : NO_DATA,
        count: count
    };

    return averageStats;
}

export function sortSubdivisionStats(subdivisionStats: SubdivisionFullStats[], sortedBy: Key, sortingDirection: SortingDirection) {
    switch (sortedBy) {
        case Key.Name:
            subdivisionStats.sort((a, b) => a.name.localeCompare(b.name) * sortingDirection);
            break;
        case Key.HitRate:
            subdivisionStats.sort((a, b) => a.hitRate !== NO_DATA ? (a.hitRate - b.hitRate) * sortingDirection : 1);
            break;
        case Key.EnemyHitRate:
            subdivisionStats.sort((a, b) => a.enemyHitRate !== NO_DATA ? (a.enemyHitRate - b.enemyHitRate) * sortingDirection : 1);
            break;
        case Key.AveragePoints:
            subdivisionStats.sort((a, b) => a.averagePoints !== NO_DATA ? (a.averagePoints - b.averagePoints) * sortingDirection : 1);
            break;
        case Key.AverageEnemyPoints:
            subdivisionStats.sort((a, b) => a.averageEnemyPoints !== NO_DATA ? (a.averageEnemyPoints - b.averageEnemyPoints) * sortingDirection : 1);
            break;
        case Key.AverageDamage:
            subdivisionStats.sort((a, b) => a.averageDamage !== NO_DATA ? (a.averageDamage - b.averageDamage) * sortingDirection : 1);
            break;
        case Key.Count:
            subdivisionStats.sort((a, b) => (a.count - b.count) * sortingDirection);
            break;
    }
}

export function sortRegionStats(regionStats: RegionStats[], sortedBy: Key, sortingDirection: SortingDirection) {
    switch (sortedBy) {
        case Key.Name:
            regionStats.sort((a, b) => a.average.name.localeCompare(b.average.name) * sortingDirection);
            break;
        case Key.HitRate:
            regionStats.sort((a, b) => a.average.hitRate !== NO_DATA ? (a.average.hitRate - b.average.hitRate) * sortingDirection : 1);
            break;
        case Key.EnemyHitRate:
            regionStats.sort((a, b) => a.average.enemyHitRate !== NO_DATA ? (a.average.enemyHitRate - b.average.enemyHitRate) * sortingDirection : 1);
            break;
        case Key.AveragePoints:
            regionStats.sort((a, b) => a.average.averagePoints !== NO_DATA ? (a.average.averagePoints - b.average.averagePoints) * sortingDirection : 1);
            break;
        case Key.AverageEnemyPoints:
            regionStats.sort((a, b) => a.average.averageEnemyPoints !== NO_DATA ? (a.average.averageEnemyPoints - b.average.averageEnemyPoints) * sortingDirection : 1);
            break;
        case Key.AverageDamage:
            regionStats.sort((a, b) => a.average.averageDamage !== NO_DATA ? (a.average.averageDamage - b.average.averageDamage) * sortingDirection : 1);
            break;
        case Key.Count:
            regionStats.sort((a, b) => (a.average.count - b.average.count) * sortingDirection);
            break;
    }
}