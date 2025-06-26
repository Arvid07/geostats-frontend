import {getFillColor, handleMouseMove} from "@/router/utils.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {Context} from "@/App.tsx";
import * as React from "react";
import type {SubdivisionFullStats, SubdivisionStats} from "../utils";
import HoverCard from "@/router/components/HoverCard.tsx";
import type {CountryMapData, RegionMapData, ViewBox} from "../CountryPage";

interface Props {
    countryCode: string | undefined;
    subdivisionStats: Map<string, SubdivisionStats>;
    regionStats: Map<string, SubdivisionFullStats>;
    mapData: CountryMapData | RegionMapData | null;
    viewBox: ViewBox | null;
    setViewBox: React.Dispatch<React.SetStateAction<ViewBox | null>>;
}

const MIN_ZOOM_SCALE = 1/5;
const WIDTH = 800;
const HEIGHT = 600;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function CountryMap({countryCode, subdivisionStats, regionStats, mapData, viewBox, setViewBox}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [subdivisionCode, setSubdivisionCode] = useState<string | null>(null);
    const [subdivisionName, setSubdivisionName] = useState("");
    const [hasCoverage, setHasCoverage] = useState(false);
    const [scale, setScale] = useState(1);

    const svgRef = useRef<SVGSVGElement>(null);
    const coordsRef = useRef({ x: 0, y: 0 });
    const hoverCardRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<number | null>(null);

    const {dataFormat} = useContext(Context);

    useEffect(() => {
        if (!mapData) {
            return;
        }

        setScale(Math.floor(100 * Math.min(WIDTH / mapData.width, HEIGHT / mapData.height)) / 100);
    }, [mapData]);

    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.addEventListener("wheel", (event) => {
                if (!viewBox || !mapData || !svgRef.current) {
                    return;
                }

                event.preventDefault();

                const { left, top, width: pxW, height: pxH } = svgRef.current.getBoundingClientRect();

                const offsetX = event.clientX - left;
                const offsetY = event.clientY - top;
                const svgPointX = viewBox.x + (offsetX / pxW) * viewBox.width;
                const svgPointY = viewBox.y + (offsetY / pxH) * viewBox.height;

                let scale = 1 + Math.abs(event.deltaY) * 0.001;
                if (event.deltaY < 0) {
                    scale = 1 / scale;
                }

                const minW = mapData.width * MIN_ZOOM_SCALE;
                const minH = mapData.height * MIN_ZOOM_SCALE;

                const newW = clamp(viewBox.width * scale, minW, mapData.width);
                const newH = clamp(viewBox.height * scale, minH, mapData.height);

                let newX = svgPointX - (offsetX / pxW) * newW;
                let newY = svgPointY - (offsetY / pxH) * newH;

                const maxX = mapData.width - newW;
                const maxY = mapData.height - newH;

                newX = clamp(newX, 0, maxX);
                newY = clamp(newY, 0, maxY);

                setViewBox({
                    x: newX,
                    y: newY,
                    width: newW,
                    height: newH
                });
            });
        }
    }, [mapData, setViewBox, viewBox]);

    function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
        const svg = event.currentTarget;
        svg.setPointerCapture(event.pointerId);
        setIsDragging(true);
    }

    function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
        if (!isDragging || !viewBox || !mapData) {
            return;
        }

        const svg = event.currentTarget;
        const { width: pxW, height: pxH } = svg.getBoundingClientRect();

        const dx = event.movementX * (viewBox.width / pxW);
        const dy = event.movementY * (viewBox.height / pxH);

        let newX = viewBox.x - dx;
        let newY = viewBox.y - dy;

        const minX = 0;
        const maxX = mapData.width - viewBox.width;
        const minY = 0;
        const maxY = mapData.height - viewBox.height;

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
        <div className={`flex items-center justify-center bg-card w-[800px] h-[600px] overflow-hidden rounded-xl`}>
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
                        flagSrc={(regionCode, subRegionCode) => `/flags/subdivisions/${regionCode.toUpperCase()}/${subRegionCode}.svg`}
                        hasCoverage={hasCoverage}
                    />
                </div>
            }
            <svg
                className={`${isDragging ? "cursor-grab" : "cursor-default"}`}
                ref={svgRef}
                style={{scale: scale}}
                width={mapData?.width ?? 0}
                height={mapData?.height ?? 0}
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
            >
                {mapData && mapData.subdivisions.map((subdivision) => {
                    const stats = subdivisionStats.get(subdivision.id) ?? regionStats.get(subdivision.id);
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