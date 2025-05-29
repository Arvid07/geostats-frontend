import * as React from "react";
import type { MapData } from "../../../Components.ts";

interface Props {
    hoverCardRef: React.RefObject<HTMLDivElement | null>;
    coordsRef: React.RefObject<{ x: number, y: number }>;
    countryCode: string;
    countryName: string;
    mapData: MapData | null;
}

function HoverCard({ hoverCardRef, coordsRef, countryName, countryCode, mapData }: Props) {

    function getPointsRatio(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);
            const enemyStats = mapData.enemyStats.get(countryCode);

            if (stats && enemyStats) {
                return Math.round((stats.points / stats.count) - (enemyStats.points / enemyStats.count));
            }
        }
    }

    function getAveragePoints(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);
            if (stats) {
                return Math.round(stats.points / stats.count);
            }
        }
    }

    function getCount(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);

            if (stats) {
                return stats.count;
            }
        }
    }

    return (
        <div
            hidden={true}
            ref={hoverCardRef}
            style={{
                left: coordsRef.current.x,
                top: coordsRef.current.y
            }}
            className={"flex absolute items-center justify-between space-x-4 bg-popover text-popover-foreground " +
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
                "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
                "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
                "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50" +
                "origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 " +
                "shadow-md outline-hidden"}
        >
            <img className={"w-fit h-fit"} src={`https://flagsapi.com/${countryCode}/flat/64.png`} alt={`${countryName} Flag`}/>
            <div className={"space-y-1"}>
                <h4 className={"text-lg font-semibold"}>{countryName}</h4>
                <p className={"text-sm"}>Avg. Points: {getAveragePoints(countryCode) ?? "N/A"}</p>
                <p className={"text-sm"}>Avg. Damage: {getPointsRatio(countryCode) ?? "N/A"}</p>
                <p className={"text-sm"}>Count: {getCount(countryCode) ?? 0}</p>
            </div>
        </div>
    );
}

export default HoverCard;