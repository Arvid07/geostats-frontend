import {useParams} from "react-router-dom";
import ContainerPage from "@/router/ContainerPage.tsx";
import {useContext, useEffect, useState} from "react";
import type {
    CountryStatsResponse,
    Stats,
    StatsGuess,
    TeamStatsGuess
} from "@/router/country-page/components/Components.ts";
import {Context} from "@/App.tsx";
import {TeamGameMode} from "@/Components.ts";
import {
    getCountryName,
    getDuelsStats,
    getTeamDuelsStats,
    type SubdivisionAdvancedStats
} from "@/router/country-page/utils.ts";
import CountryMap from "@/router/country-page/components/CountryMap.tsx";
import type {SubdivisionInfo} from "@/router/country-page/components/utils.ts";
import {getCountryData, getRegionData} from "@/utils.tsx";
import DataTable from "@/router/country-page/components/DataTable.tsx";

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
    const [rawGameModeStats, setRawGameModeStats] = useState<StatsGuess[] | TeamStatsGuess[] | null>(null);
    const [countryMapData, setCountryMapData] = useState<CountryMapData | null>(null);
    const [, setRegionMapData] = useState<RegionMapData | null>(null);
    const [viewBox, setViewBox] = useState<ViewBox | null>(null);
    const [subdivisionStats, setSubdivisionStats] = useState<Map<string, SubdivisionAdvancedStats>>(new Map())
    const [subdivisions, setSubdivisions] = useState<Map<string, SubdivisionInfo> | null>(null);

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
            .then((countryMapData) => {
                setCountryMapData(countryMapData);
                setViewBox({
                    x: 0,
                    y: 0,
                    width: countryMapData.width,
                    height: countryMapData.height
                })
            })
            .catch((e) => console.log(e));

        getRegionData<RegionMapData>(countryCode.toUpperCase())
            .then((regionMapData) => {
                setRegionMapData(regionMapData);
            });
    }, [countryCode]);

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
        if (!rawStats || !subdivisions) {
            return;
        }

        switch (gameMode) {
            case TeamGameMode.Duels: {
                setSubdivisionStats(getDuelsStats(rawStats.duels, subdivisions, time));
                setRawGameModeStats(rawStats.duels);
                break;
            }
            case TeamGameMode.DuelsRanked: {
                setSubdivisionStats(getDuelsStats(rawStats.duelsRanked, subdivisions, time));
                setRawGameModeStats(rawStats.duelsRanked);
                break;
            }
            case TeamGameMode.TeamDuels:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamDuels, subdivisions, time));
                setRawGameModeStats(rawStats.teamDuels);
                break;
            case TeamGameMode.TeamDuelsRanked:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamDuelsRanked, subdivisions, time));
                setRawGameModeStats(rawStats.teamDuelsRanked);
                break;
            case TeamGameMode.TeamFun:
                setSubdivisionStats(getTeamDuelsStats(rawStats.teamFun, subdivisions, time));
                setRawGameModeStats(rawStats.teamFun);
                break;
        }
    }, [gameMode, rawStats, time, subdivisions]);

    if (countryName) {
        return (
            <ContainerPage>
                <div className={"flex flex-col items-center h-full gap-10 mt-10"}>
                    <p className={"flex flex-row items-center justify-center gap-2 text-3xl"}>
                        <img
                            className={"w-15"}
                            src={`https://raw.githubusercontent.com/amckenna41/iso3166-flag-icons/20ca9f16a84993a89cedd1238e4363bd50175d87/iso3166-1-icons/${countryCode?.toLowerCase()}.svg`}
                            alt={`${countryName} Flag`}
                        />
                        {countryName}
                    </p>
                    <div className={"flex flex-row gap-5"}>
                        <CountryMap
                            countryCode={countryCode}
                            subdivisionStats={subdivisionStats}
                            countryMapData={countryMapData}
                            viewBox={viewBox}
                            setViewBox={setViewBox}
                        />
                        <div className={"flex bg-card w-auto h-[600px] overflow-auto rounded-xl scrollbar-hidden"}>
                            <div className={"p-10"}>
                                <DataTable rawGameModeStats={rawGameModeStats} subdivisions={subdivisions} countryCode={countryCode}/>
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