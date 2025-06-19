import {ComposableMap, ZoomableGroup} from "react-simple-maps";
import {useContext, useEffect, useRef, useState} from "react";
import data from "./data.json";
import HoverCard from "@/router/components/HoverCard.tsx";
import {Context} from "@/App.tsx";
import {getFillColorCalculated, handleMouseMove} from "@/router/utils.ts";
import {useNavigate} from "react-router-dom";

function GeoGuessrMap() {
    const coordsRef = useRef({ x: 0, y: 0 });
    const hoverCardRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<number | null>(null);

    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [countryName, setCountryName] = useState("");
    const [hasCoverage, setHasCoverage] = useState(false);

    const navigate = useNavigate();

    const {
        mapData,
        dataFormat,
        countries
    } = useContext(Context);

    useEffect(() => {
        if (!countryCode) {
            return;
        }

        const countryNames = new Intl.DisplayNames(["en"], {type: "region"});
        setCountryName(countryNames.of(countryCode)!);
    }, [countryCode]);

    function getCountryColor(countryId: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryId);
            const enemyStats = mapData.enemyStats.get(countryId);

            if (stats) {
                return getFillColorCalculated(dataFormat, stats?.points ?? 0, enemyStats?.points ?? 0, stats?.count ?? 0, enemyStats?.count ?? 0);
            }
        }
    }

    function getAverageDamage(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);
            const enemyStats = mapData.enemyStats.get(countryCode);
            if (stats && enemyStats) {
                return <p className={"text-sm"}>Avg. Damage: {Math.round((stats.points / stats.count) - (enemyStats.points / enemyStats.count))}</p>;
            }
        }

        return <p className={"text-sm"}>Avg. Damage: N/A</p>;
    }

    function getAveragePoints(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);

            if (stats) {
                return <p className={"text-sm"}>Avg. Points: {Math.round(stats.points / stats.count)}</p>;
            }
        }

        return <p className={"text-sm"}>Avg. Points: N/A</p>;
    }

    function getCount(countryCode: string) {
        if (mapData) {
            const stats = mapData.stats.get(countryCode);

            if (stats) {
                return <p className={"text-sm"}>Count: {stats.count}</p>;
            }
        }

        return <p className={"text-sm"}>Count: 0</p>;
    }

    return (
        <div className={"flex items-center justify-center bg-card w-225 h-150 overflow-hidden rounded-xl"}>
            { countryCode && (
                <HoverCard
                    hoverCardRef={hoverCardRef}
                    coordsRef={coordsRef}
                    regionCode={countryCode}
                    subRegionCode={null}
                    regionName={countryName}
                    getAbsoluteData={getAveragePoints}
                    getDamageData={getAverageDamage}
                    getCount={getCount}
                    flagSrc={(countryCode) => `https://raw.githubusercontent.com/amckenna41/iso3166-flag-icons/20ca9f16a84993a89cedd1238e4363bd50175d87/iso3166-1-icons/${countryCode.toLowerCase()}.svg`}
                    hasCoverage={hasCoverage}
                />
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
                    onMouseMove={(event) => handleMouseMove(event, coordsRef, hoverCardRef, hoverTimerRef)}
                    onMove={() => {
                        if (hoverCardRef.current) {
                            hoverCardRef.current.hidden = true;
                        }
                    }}
                >
                    <defs>
                        <pattern id={"striped-pattern"} width={"5"} height={"5"} patternUnits={"userSpaceOnUse"} patternTransform={"rotate(45 50 50)"}>
                            <line stroke={"#ffffff25"} strokeWidth={"5px"} y2={"10"}/>
                        </pattern>
                    </defs>
                    {data.map((country) => {
                        if (country.id && countries.has(country.id)) {
                            return (
                                <path
                                    id={country.id}
                                    className={country.className ?? undefined}
                                    d={country.d}
                                    stroke={country.stroke ?? undefined}
                                    fill={getCountryColor(country.id ?? "") ?? country.fill}
                                    onMouseOver={(event) => {
                                        setCountryCode(country.id ?? "");
                                        event.currentTarget.style.cursor = "pointer";
                                        setHasCoverage(true);
                                    }}
                                    onMouseLeave={(event) => {
                                        setCountryCode(null);
                                        event.currentTarget.style.cursor = "default";
                                    }}
                                    onClick={() => navigate(`/countries/${country.id.toLowerCase()}`)}
                                />
                            )
                        } else {
                            return (
                                <path
                                    id={country.id ?? undefined}
                                    className={country.className ?? undefined}
                                    d={country.d}
                                    stroke={country.stroke ?? undefined}
                                    fill={getCountryColor(country.id ?? "") ?? country.fill}
                                    onMouseOver={() => {
                                        setCountryCode(country.id ?? "");
                                        setHasCoverage(false);
                                    }}
                                    onMouseLeave={(event) => {
                                        setCountryCode(null);
                                        event.currentTarget.style.cursor = "default";
                                    }}
                                />
                            )
                        }
                    })}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    )
}

export default GeoGuessrMap;