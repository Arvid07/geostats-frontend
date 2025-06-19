import {DataFormat, type Player, type PlayerStats, type StatsResponse} from "@/Components.ts";
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
                case 400:
                case 401:
                case 410:
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

export function getFillColorCalculated(dataFormat: DataFormat, points: number, enemyPoints: number, count: number, enemyCount: number) {
    switch (dataFormat) {
        case DataFormat.Absolute:
            return `hsl(${120 * (points / count) / 5000}, 100%, 50%)`;
        case DataFormat.Damage: {
            const relativePoints = ((points / count) - (enemyPoints / enemyCount) + 5000) / 10000;
            return `hsl(${120 * getRelativePoints(relativePoints)}, 100%, 50%)`;
        }
        case DataFormat.Country:
            return "red-900"
    }
}

export function getFillColor(dataFormat: DataFormat, averagePoints: number, averageDamage: number) {
    switch (dataFormat) {
        case DataFormat.Absolute:
            return `hsl(${120 * averagePoints / 5000}, 100%, 50%)`;
        case DataFormat.Damage: {
            const relativePoints = (averageDamage + 5000) / 10000;
            return `hsl(${120 * getRelativePoints(relativePoints)}, 100%, 50%)`;
        }
        case DataFormat.Country:
            return "red-900"
    }
}

export function getRelativePoints(x: number) {
    return 0.5
        + (67043 / 16038) * (x - 0.5)
        - (2746255 / 37422) * Math.pow(x - 0.5, 3)
        + (3216250 / 6237) * Math.pow(x - 0.5, 5)
        - (61300000 / 56133) * Math.pow(x - 0.5, 7);
}

export function handleMouseMove(
    event: React.MouseEvent<SVGGElement>,
    coordsRef: React.RefObject<{ x: number; y: number }>,
    hoverCardRef: React.RefObject<HTMLDivElement | null>,
    hoverTimerRef: React.RefObject<number | null>
) {
    coordsRef.current = { x: event.clientX, y: event.clientY };

    if (hoverCardRef.current) {
        hoverCardRef.current.style.left = `${coordsRef.current.x + 10}px`;
        hoverCardRef.current.style.top = `${coordsRef.current.y + 10}px`;

        hoverCardRef.current.hidden = true;
    }

    if (hoverTimerRef.current) {
        window.clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = window.setTimeout(() => {
        if (hoverCardRef.current) {
            hoverCardRef.current.hidden = false;
        }
    }, 350);
}
