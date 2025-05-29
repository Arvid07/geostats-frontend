import type {Player, PlayerStats, StatsResponse} from "@/Components.ts";
import * as React from "react";

export function makePlayerStatsRequest(
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>,
    setIsLinked: React.Dispatch<React.SetStateAction<boolean | null>>,
    setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats | null>>,
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
) {
    fetch("http://localhost:8080/stats", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then(async (response) => {
        if (!response.ok) {
            switch (response.status) {
                case 400: case 401: case 410:
                    setIsLoggedIn(false);
                    setIsLinked(false);
                    break;
                case 409:
                    setIsLoggedIn(true);
                    setIsLinked(false);
                    break;
                default:
                    setIsLoggedIn(true);
                    setIsLinked(true);
                    break
            }

            const errText = await response.text();
            throw new Error(errText);
        }

        return await response.json() as StatsResponse;
    }).then((response) => {
        console.log(response);
        if (response.stats && response.enemyStats) {
            setPlayerStats({
                stats: response.stats,
                enemyStats: response.enemyStats
            });
        }

        setPlayer(response.player);
        setIsLoggedIn(true);
        setIsLinked(true);
    }).catch((err: Error) => {
        console.error(err.message);
    });
}