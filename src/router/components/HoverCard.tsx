import * as React from "react";
import {type JSX, useContext} from "react";
import {DataFormat} from "@/Components.ts";
import {Context} from "@/App.tsx";

interface Props {
    hoverCardRef: React.RefObject<HTMLDivElement | null>;
    coordsRef: React.RefObject<{ x: number, y: number }>;
    regionCode: string;
    subRegionCode: string | null;
    regionName: string;
    getAbsoluteData: (regionId: string) => JSX.Element;
    getDamageData: (regionId: string) => JSX.Element;
    getCount: (regionId: string) => JSX.Element;
    flagSrc: (countryCode: string, subdivisionsCode: string | undefined) => string;
    hasCoverage: boolean;
}

function HoverCard({hoverCardRef, coordsRef, regionName, regionCode, subRegionCode, getAbsoluteData, getDamageData, getCount, flagSrc, hasCoverage}: Props) {
    const {dataFormat} = useContext(Context);

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
            <img className={"w-20"} src={flagSrc(regionCode.toUpperCase(), subRegionCode?.toUpperCase())} alt={`${regionName} Flag`}/>
            <div className={"space-y-1"}>
                <h4 className={"text-lg font-semibold"}>{regionName}</h4>
                {hasCoverage && dataFormat === DataFormat.Absolute && getAbsoluteData(subRegionCode ?? regionCode)}
                {hasCoverage && dataFormat === DataFormat.Damage && getDamageData(subRegionCode ?? regionCode)}
                {hasCoverage && getCount(subRegionCode ?? regionCode)}
                {!hasCoverage && <p className={"text-sm"}>No Coverage</p>}
            </div>
        </div>
    );
}

export default HoverCard;