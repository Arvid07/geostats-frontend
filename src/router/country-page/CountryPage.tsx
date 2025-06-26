import {useParams} from "react-router-dom";
import ContainerPage from "@/router/ContainerPage.tsx";
import {useContext, useEffect, useState} from "react";
import type {CountryStatsResponse, Stats} from "@/router/country-page/components/Components.ts";
import {Context} from "@/App.tsx";
import {
    getCountryName,
    getDuelsStats,
    getSoloStats,
    getTeamDuelsStats,
    type SubdivisionFullStats
} from "@/router/country-page/utils.ts";
import CountryMap from "@/router/country-page/components/CountryMap.tsx";
import type {SubdivisionInfo} from "@/router/country-page/components/utils.ts";
import {getCountryData, getRegionData} from "@/utils.tsx";
import DataTable from "@/router/country-page/components/DataTable.tsx";
import {GameMode} from "@/Components.ts";
import {DataView} from "@/router/countries-page/components/CustomizeData.tsx";

export type CountryMapData = {
    width: number;
    height: number;
    subdivisions: SubdivisionData[];
}

export type SubdivisionData = {
    id: string;
    name: string;
    region: string;
    hasCoverage: boolean;
    d: string;
}

export type RegionMapData = {
    width: number;
    height: number;
    subdivisions: RegionData[];
}

export type RegionData = {
    id: string;
    name: string;
    hasCoverage: boolean;
    d: string;
}

export interface ViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

function CountryPage() {
    const {countryCode} = useParams<{countryCode: string}>();

    const [rawStats, setRawStats] = useState<Stats | null>(null);
    const [viewBox, setViewBox] = useState<ViewBox | null>(null);
    const [mapData, setMapData] = useState<CountryMapData | RegionMapData | null>(null);
    const [regionMapData, setRegionMapData] = useState<RegionMapData | null>(null);
    const [countryMapData, setCountryMapData] = useState<CountryMapData | null>(null);
    const [subdivisionStats, setSubdivisionStats] = useState<Map<string, SubdivisionFullStats>>(new Map());
    const [regionStats, setRegionStats] = useState<Map<string, SubdivisionFullStats>>(new Map());
    const [subdivisions, setSubdivisions] = useState<Map<string, SubdivisionInfo> | null>(null);
    const [regions, setRegions] = useState<Map<string, string[]> | null>(null);
    const [dataView, setDataView] = useState<Set<DataView>>(new Set());
    
    const countryName = getCountryName(countryCode);

    const {
        time,
        gameMode,
        setIsLoggedIn,
        setIsLinked,
        setPlayer
    } = useContext(Context);

    useEffect(() => {
        fetch(`http://localhost:8080/country/${countryCode}`, {
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

            return await response.json() as CountryStatsResponse;
        }).then(response => {
            setRawStats(response.stats);
            setPlayer(response.player);
            setIsLoggedIn(true);
            setIsLinked(true);
        }).catch((err: Error) => {
            console.error(err.message);
        });
    }, [countryCode, setIsLinked, setIsLoggedIn, setPlayer]);

    useEffect(() => {
        if (!countryCode) {
            return;
        }

        getCountryData<CountryMapData>(countryCode.toUpperCase())
            .then(setCountryMapData);

        getRegionData<RegionMapData>(countryCode.toUpperCase())
            .then(setRegionMapData);
    }, [countryCode]);

    useEffect(() => {
        if (dataView.has(DataView.Region) && regionMapData) {
            setMapData(regionMapData);

            setViewBox({
                x: 0,
                y: 0,
                width: regionMapData.width,
                height: regionMapData.height
            });
        }
        else if (countryMapData) {
            setMapData(countryMapData);

            setViewBox({
                x: 0,
                y: 0,
                width: countryMapData.width,
                height: countryMapData.height
            });
        }
    }, [countryMapData, dataView, regionMapData]);

    useEffect(() => {
        if (!countryMapData) {
            return;
        }

        const subdivisions = new Map<string, SubdivisionInfo>;

        for (const subdivision of countryMapData.subdivisions.filter((subdivision) => subdivision.hasCoverage)) {
            const subdivisionInfo: SubdivisionInfo = {
                name: subdivision.name,
                region: subdivision.region
            }

            subdivisions.set(subdivision.id, subdivisionInfo);
        }

        setSubdivisions(subdivisions);
    }, [countryMapData]);

    useEffect(() => {
        if (!regionMapData || !subdivisions) {
            return;
        }
        
        const regionMap = new Map<string, string[]>();

        for (const [id, info] of subdivisions) {
            if (!regionMap.has(info.region)) {
                regionMap.set(info.region, [id])
            } else {
                const subdivisionsInRegion = regionMap.get(info.region)!;
                subdivisionsInRegion.push(id);

                regionMap.set(info.region, subdivisionsInRegion);
            }
        }
        
        setRegions(regionMap);
    }, [regionMapData, subdivisions]);

    useEffect(() => {
        if (!rawStats || !subdivisions) {
            return;
        }

        switch (gameMode) {
            case GameMode.Solo:
                setSubdivisionStats(getSoloStats(rawStats.solo, subdivisions, time));
                break;
            case GameMode.Duels: {
                setSubdivisionStats(getDuelsStats(rawStats.duels, subdivisions, time));
                break;
            }
            case GameMode.DuelsRanked: {
                setSubdivisionStats(getDuelsStats(rawStats.duelsRanked, subdivisions, time));
                break;
            }
            case GameMode.TeamDuels:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamDuels, subdivisions, time));
                break;
            case GameMode.TeamDuelsRanked:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamDuelsRanked, subdivisions, time));
                break;
            case GameMode.TeamFun:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamFun, subdivisions, time));
                break;
        }
    }, [gameMode, rawStats, time, subdivisions, dataView]);

    useEffect(() => {
        if (!rawStats || !subdivisions || !regions || !dataView.has(DataView.Region)) {
            return;
        }

        switch (gameMode) {
            case GameMode.Solo:
                setRegionStats(getSoloStats(rawStats.solo, subdivisions, time, true));
                break;
            case GameMode.Duels: {
                setRegionStats(getDuelsStats(rawStats.duels, subdivisions, time, true));
                break;
            }
            case GameMode.DuelsRanked: {
                setRegionStats(getDuelsStats(rawStats.duelsRanked, subdivisions, time, true));
                break;
            }
            case GameMode.TeamDuels:
                setRegionStats(getTeamDuelsStats(rawStats.teamDuels, subdivisions, time, true));
                break;
            case GameMode.TeamDuelsRanked:
                setRegionStats(getTeamDuelsStats(rawStats.teamDuelsRanked, subdivisions, time, true));
                break;
            case GameMode.TeamFun:
                setRegionStats(getTeamDuelsStats(rawStats.teamFun, subdivisions, time, true));
                break;
        }
    }, [gameMode, rawStats, time, subdivisions, dataView, regions]);

    if (countryName) {
        return (
            <ContainerPage>
                <div className={"flex flex-col items-center h-full gap-10 mt-10"}>
                    <p className={"flex flex-row items-center justify-center gap-2 text-3xl"}>
                        <img
                            className={"w-15"}
                            src={`/flags/countries/${countryCode?.toLowerCase()}.svg`}
                            alt={`${countryName} Flag`}
                        />
                        {countryName}
                    </p>
                    <div className={"flex flex-row gap-5"}>
                        <CountryMap
                            countryCode={countryCode}
                            subdivisionStats={subdivisionStats}
                            regionStats={regionStats}
                            mapData={mapData}
                            viewBox={viewBox}
                            setViewBox={setViewBox}
                        />
                        <div className={"flex bg-card w-auto h-[600px] overflow-auto rounded-xl scrollbar-hidden"}>
                            <div className={"p-10"}>
                                <DataTable
                                    regions={regions}
                                    subdivisions={subdivisions}
                                    subdivisionStatsMap={subdivisionStats}
                                    regionStatsMap={regionStats}
                                    countryCode={countryCode}
                                    dataView={dataView}
                                    setDataView={setDataView}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </ContainerPage>
        );
    } else {
        return (
            <ContainerPage>
                <div className={"flex flex-col items-center justify-center h-full"}>
                    <p className={"text-xl"}>Country with id "{countryCode}" could not be found!</p>
                </div>
            </ContainerPage>
        );
    }
}

export default CountryPage;