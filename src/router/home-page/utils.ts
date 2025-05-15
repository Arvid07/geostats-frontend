import * as React from "react";
import {type MapData, type PlayerStats, TeamGameMode} from "@/router/home-page/Components.ts";

export function setMapDataFromResponse(
    setMapData: React.Dispatch<React.SetStateAction<MapData | null>>,
    playerStats: PlayerStats,
    gameMode: TeamGameMode
) {
    switch (gameMode) {
        case TeamGameMode.Duels:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.duels)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.duels))
            });
            break;
        case TeamGameMode.DuelsRanked:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.duelsRanked)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.duelsRanked))
            });
            break;
        case TeamGameMode.TeamDuels:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.teamDuels)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.teamDuels))
            });
            break;
        case TeamGameMode.TeamDuelsRanked:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.teamDuelsRanked)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.teamDuelsRanked))
            });
            break;
        case TeamGameMode.TeamFun:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.teamFun)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.teamFun))
            });
            break;
        case TeamGameMode.Ranked:
            setMapData({
                stats: new Map(Object.entries(playerStats.stats.duelsRanked)),
                enemyStats: new Map(Object.entries(playerStats.enemyStats.duelsRanked))
            });
            break;
    }
}