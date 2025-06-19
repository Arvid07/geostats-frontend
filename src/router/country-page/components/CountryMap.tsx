import {getFillColor, handleMouseMove} from "@/router/utils.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {Context} from "@/App.tsx";
import * as React from "react";
import type {SubdivisionAdvancedStats} from "../utils";
import HoverCard from "@/router/components/HoverCard.tsx";
import type { CountryMapData, ViewBox } from "../CountryPage";

interface Props {
    countryCode: string | undefined;
    subdivisionStats: Map<string, SubdivisionAdvancedStats>;
    countryMapData: CountryMapData | null;
    viewBox: ViewBox | null;
    setViewBox: React.Dispatch<React.SetStateAction<ViewBox | null>>;
}

const MIN_ZOOM_SCALE = 1/5;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function CountryMap({countryCode, subdivisionStats, countryMapData, viewBox, setViewBox}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [subdivisionCode, setSubdivisionCode] = useState<string | null>(null);
    const [subdivisionName, setSubdivisionName] = useState("");
    const [hasCoverage, setHasCoverage] = useState(false);
    const [scale, setScale] = useState(100);

    const coordsRef = useRef({ x: 0, y: 0 });
    const hoverCardRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<number | null>(null);

    const {dataFormat} = useContext(Context);

    useEffect(() => {
        if (!countryMapData) {
            return;
        }

        setScale(Math.floor(100 * Math.min(800 / countryMapData.width, 600 / countryMapData.height)) / 100);
    }, [countryMapData]);

    function handleZoom(event: React.WheelEvent<SVGSVGElement>) {
        if (!viewBox || !countryMapData) {
            return;
        }

        const svg = event.currentTarget;
        const { left, top, width: pxW, height: pxH } = svg.getBoundingClientRect();

        const offsetX = event.clientX - left;
        const offsetY = event.clientY - top;
        const svgPointX = viewBox.x + (offsetX / pxW) * viewBox.width;
        const svgPointY = viewBox.y + (offsetY / pxH) * viewBox.height;

        let scale = 1 + Math.abs(event.deltaY) * 0.001;
        if (event.deltaY < 0) {
            scale = 1 / scale;
        }

        const minW = countryMapData.width * MIN_ZOOM_SCALE;
        const minH = countryMapData.height * MIN_ZOOM_SCALE;

        const newW = clamp(viewBox.width * scale, minW, countryMapData.width);
        const newH = clamp(viewBox.height * scale, minH, countryMapData.height);

        let newX = svgPointX - (offsetX / pxW) * newW;
        let newY = svgPointY - (offsetY / pxH) * newH;

        const maxX = countryMapData.width - newW;
        const maxY = countryMapData.height - newH;

        newX = clamp(newX, 0, maxX);
        newY = clamp(newY, 0, maxY);

        setViewBox({
            x: newX,
            y: newY,
            width: newW,
            height: newH
        });
    }

    function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
        const svg = event.currentTarget;
        svg.setPointerCapture(event.pointerId);
        setIsDragging(true);
    }

    function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
        if (!isDragging || !viewBox || !countryMapData) {
            return;
        }

        const svg = event.currentTarget;
        const { width: pxW, height: pxH } = svg.getBoundingClientRect();

        const dx = event.movementX * (viewBox.width / pxW);
        const dy = event.movementY * (viewBox.height / pxH);

        let newX = viewBox.x - dx;
        let newY = viewBox.y - dy;

        const minX = 0;
        const maxX = countryMapData.width - viewBox.width;
        const minY = 0;
        const maxY = countryMapData.height - viewBox.height;

        newX = clamp(newX, minX, maxX);
        newY = clamp(newY, minY, maxY);

        setViewBox({
            x: newX,
            y: newY,
            width: viewBox.width,
            height: viewBox.height
        });
    }

    function onPointerUp(event: React.PointerEvent<SVGSVGElement>) {
        const svg = event.currentTarget;
        svg.releasePointerCapture(event.pointerId);
        setIsDragging(false);
    }

    function getAverageDamage(countryCode: string) {
        if (subdivisionStats) {
            const stats = subdivisionStats.get(countryCode);

            if (stats) {
                return <p className={"text-sm"}>Avg. Damage: {stats.averageDamage}</p>;
            }
        }

        return <p className={"text-sm"}>Avg. Damage: N/A</p>;
    }

    function getAveragePoints(subdivisionCode: string) {
        if (subdivisionStats) {
            const stats = subdivisionStats.get(subdivisionCode);

            if (stats) {
                return <p className={"text-sm"}>Avg. Points: {stats.averagePoints}</p>;
            }
        }

        return <p className={"text-sm"}>Avg. Points: N/A</p>;
    }

    function getCount(subdivisionCode: string) {
        if (subdivisionStats) {
            const stats = subdivisionStats.get(subdivisionCode);

            if (stats) {
                return <p className={"text-sm"}>Count: {stats.count}</p>;
            }
        }

        return <p className={"text-sm"}>Count: 0</p>;
    }

    return (
        <div className={"flex items-center justify-center bg-card w-[800px] h-[600px] overflow-hidden rounded-xl"}>
            {subdivisionCode &&
                <div className={"z-50"}>
                    <HoverCard
                        hoverCardRef={hoverCardRef}
                        coordsRef={coordsRef}
                        regionCode={countryCode ?? ""}
                        subRegionCode={subdivisionCode}
                        regionName={subdivisionName}
                        getAbsoluteData={getAveragePoints}
                        getDamageData={getAverageDamage}
                        getCount={getCount}
                        flagSrc={(regionCode, subRegionCode) => `https://raw.githubusercontent.com/amckenna41/iso3166-flag-icons/20ca9f16a84993a89cedd1238e4363bd50175d87/iso3166-2-icons/${regionCode}/${subRegionCode}.svg`}
                        hasCoverage={hasCoverage}
                    />
                </div>
            }
            <svg
                className={`${isDragging ? "cursor-grab" : "cursor-default"}`}
                style={{scale: scale}}
                width={countryMapData?.width ?? 0}
                height={countryMapData?.height ?? 0}
                viewBox={`${viewBox?.x ?? 0}, ${viewBox?.y ?? 0}, ${viewBox?.width ?? 0}, ${viewBox?.height ?? 0}`}
                fill={"none"}
                xmlns={"http://www.w3.org/2000/svg"}
                onMouseMove={(event) => handleMouseMove(event, coordsRef, hoverCardRef, hoverTimerRef)}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onWheel={handleZoom}
            >
                {countryMapData && countryMapData.subdivisions.map((subdivision) => {
                    const stats = subdivisionStats.get(subdivision.id);
                    let fillColor = "#fff";

                    if (stats) {
                        fillColor = getFillColor(
                            dataFormat,
                            stats.averagePoints,
                            stats.averageDamage
                        );
                    }

                    if (subdivision.hasCoverage) {
                        return (
                            <path
                                key={subdivision.id}
                                fill={fillColor}
                                stroke={"#3A3A3AFF"}
                                strokeWidth={0.5}
                                d={subdivision.d}
                                onMouseOver={() => {
                                    setSubdivisionCode(subdivision.id);
                                    setSubdivisionName(subdivision.name);
                                    setHasCoverage(true);
                                }}
                                onMouseLeave={() => setSubdivisionCode(null)}
                            />
                        );
                    } else {
                        return (
                            <path
                                key={subdivision.id}
                                fill={"#606060"}
                                stroke={"#3A3A3AFF"}
                                strokeWidth={0.5}
                                d={subdivision.d}
                                onMouseOver={() => {
                                    setSubdivisionCode(subdivision.id);
                                    setSubdivisionName(subdivision.name);
                                    setHasCoverage(false);
                                }}
                                onMouseLeave={() => setSubdivisionCode(null)}
                            />
                        );
                    }
                })}
            </svg>
        </div>
    );
}

export default CountryMap;