import {ComposableMap, ZoomableGroup} from "react-simple-maps";
import {useContext, useEffect, useRef, useState} from "react";
import * as React from "react";
import data from "./data.json";
import HoverCard from "@/router/home-page/map/HoverCard.tsx";
import {DataFormat} from "@/Components.ts";
import {Context} from "@/App.tsx";

function GeoGuessrMap() {
    const coordsRef = useRef({ x: 0, y: 0 });
    const hoverCardRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<number | null>(null);

    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [countryName, setCountryName] = useState("");

    const {
        mapData,
        dataFormat
    } = useContext(Context);

    useEffect(() => {
        if (!countryCode) {
            return;
        }

        const countryNames = new Intl.DisplayNames(["en"], {type: "region"})
        setCountryName(countryNames.of(countryCode)!);
    }, [countryCode]);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) {
                window.clearTimeout(hoverTimerRef.current)
            }
        }
    }, [])

    function handleMouseMove(event: React.MouseEvent<SVGSVGElement, MouseEvent>) {
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

    function getCountryColor(countryId: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryId);
            const enemyStats = mapData.enemyStats.get(countryId);

            switch (dataFormat) {
                case DataFormat.Absolute:
                    if (stats) {
                        return `hsl(${120 * (stats.points / stats.count) / 5000}, 100%, 50%)`;
                    }
                    break
                case DataFormat.Damage:
                    if (stats && enemyStats) {
                        const relativePoints = ((stats.points / stats.count) - (enemyStats.points / enemyStats.count) + 5000) / 10000;
                        return `hsl(${120 * getRelativePoints(relativePoints)}, 100%, 50%)`;
                    }
                    break;
                case DataFormat.Country:
                    break;
            }
        }
    }

    function getRelativePoints(x: number) {
        return 0.5
            + (67043/16038) * (x - 0.5)
            - (2746255/37422) * Math.pow(x - 0.5, 3)
            + (3216250/6237) * Math.pow(x - 0.5, 5)
            - (61300000/56133) * Math.pow(x - 0.5, 7);
    }

    function getCountries() {
        return data.map((country) => (
            <path
                id={country.id ?? undefined}
                className={country.className ?? undefined}
                d={country.d}
                stroke={country.stroke ?? undefined}
                fill={getCountryColor(country.id ?? "") ?? country.fill}
                onMouseOver={() => setCountryCode(country.id ?? "")}
                onMouseLeave={() => setCountryCode(null)}
            />
        ));
    }

    return (
        <div className={"flex items-center justify-center bg-card w-225 h-150 overflow-hidden rounded-xl"}>
            { countryCode && (
                <HoverCard hoverCardRef={hoverCardRef} coordsRef={coordsRef} countryCode={countryCode} countryName={countryName} mapData={mapData}/>
            )}
            <ComposableMap>
                <ZoomableGroup
                    center={[15, 15]}
                    minZoom={1}
                    translateExtent={[
                        [39.25, -53.5],
                        [839.25, 546.5]
                    ]}
                    style={{cursor: "initial"}}
                    onMouseMove={handleMouseMove}
                    onMove={() => {
                        if (hoverCardRef.current) {
                            hoverCardRef.current.hidden = true;
                        }
                    }}
                >
                    <defs>
                        <pattern id={"striped-pattern"} width={"5"} height={"5"} patternUnits={"userSpaceOnUse"}
                                 patternTransform={"rotate(45 50 50)"}>
                            <line stroke={"#ffffff25"} strokeWidth={"5px"} y2={"10"}></line>
                        </pattern>
                    </defs>
                    {getCountries()}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    )
}

export default GeoGuessrMap;