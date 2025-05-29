import * as React from "react";
import {
    type CountryStats,
    type MapData,
    type PlayerStats,
    type StatsGuess,
    TeamGameMode
} from "@/Components.ts";

function convertFromRawStats(rawStats: StatsGuess[], startTime: number): Map<string, CountryStats> {
    const stats = new Map();

    for (const stat of rawStats) {
        if (stat.time < startTime) {
            return stats;
        }

        const countryStats = stats.get(stat.roundCountryCode);
        
        if (countryStats) {
            const newStats: CountryStats = {
                count: countryStats.count + 1,
                points: countryStats.points + stat.points
            }
            
            stats.set(stat.roundCountryCode, newStats);
        } else {
            const startStats: CountryStats = {
                count: 1,
                points: stat.points
            }
            
            stats.set(stat.roundCountryCode, startStats);
        }
    }
    
    return stats;
}

export function setMapDataFromResponse(
    setMapData: React.Dispatch<React.SetStateAction<MapData | null>>,
    rawStats: PlayerStats,
    gameMode: TeamGameMode,
    time: number
) {
    switch (gameMode) {
        case TeamGameMode.Duels: {
            setMapData({
                stats: convertFromRawStats(rawStats.stats.duels, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.duels, time)
            });
            break;
        }
        case TeamGameMode.DuelsRanked:
            setMapData({
                stats: convertFromRawStats(rawStats.stats.duelsRanked, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.duelsRanked, time)
            });
            break;
        case TeamGameMode.TeamDuels:
            setMapData({
                stats: convertFromRawStats(rawStats.stats.teamDuels, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.teamDuels, time)
            });
            break;
        case TeamGameMode.TeamDuelsRanked:
            setMapData({
                stats: convertFromRawStats(rawStats.stats.teamDuelsRanked, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.teamDuelsRanked, time)
            });
            break;
        case TeamGameMode.TeamFun:
            setMapData({
                stats: convertFromRawStats(rawStats.stats.teamFun, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.teamFun, time)
            });
            break;
        case TeamGameMode.Ranked:
            setMapData({
                stats: convertFromRawStats(rawStats.stats.duels, time),
                enemyStats: convertFromRawStats(rawStats.enemyStats.duels, time)
            });
            break;
    }
}