import GeoGuessrMap from "@/router/home-page/map/GeoGuessrMap.tsx";
import {useEffect, useState} from "react";
import * as React from "react";
import type {Player} from "@/router/ContainerPage.tsx";
import SelectDataFormat from "@/router/home-page/components/DataFormat.tsx";
import SelectGameModes from "@/router/home-page/components/SelectGameModes.tsx";
import SelectTime from "@/router/home-page/components/SelectTime.tsx";
import {DataFormat, type HomePageResponse, type MapData, type PlayerStats, TeamGameMode, Time} from "@/router/home-page/Components.ts";
import {setMapDataFromResponse} from "@/router/home-page/utils.ts";

interface Props {
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
    setIsLinked: React.Dispatch<React.SetStateAction<boolean | null>>;
}

function HomePage({setPlayer, setIsLoggedIn, setIsLinked}: Props) {
    const [dataFormat, setDataFormat] = useState(DataFormat.Absolute);
    const [gameMode, setGameMode] = useState(TeamGameMode.DuelsRanked);
    const [time, setTime] = useState(Time.AllTime);
    const [playerStats, setPlayerStats] = useState<null | PlayerStats>(null);
    const [mapData, setMapData] = useState<MapData | null>(null);

    function getMonday() {
        const d = new Date()
        const day = d.getUTCDay()
        const diff = (day + 6) % 7
        d.setDate(d.getUTCDate() - diff)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }

    useEffect(() => {
        if (playerStats) {
            switch (time) {
                case Time.AllTime:
                    setMapDataFromResponse(setMapData, playerStats, gameMode, 0);
                    break;
                case Time.ThisWeek:
                    console.log(new Date(getMonday()));
                    setMapDataFromResponse(setMapData, playerStats, gameMode, getMonday());
                    break;
                case Time.Last7Days:
                    console.log(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
                    console.log(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
                    setMapDataFromResponse(setMapData, playerStats, gameMode, new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case Time.Last30Days:
                    setMapDataFromResponse(setMapData, playerStats, gameMode, new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case Time.LastYear:
                    setMapDataFromResponse(setMapData, playerStats, gameMode, new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                case Time.Custom:
                    setMapDataFromResponse(setMapData, playerStats, gameMode, 0);
                    break;
            }
        }
    }, [playerStats, setMapData, gameMode, time]);

    useEffect(() => {
        fetch("http://localhost:8080/home-page", {
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

            return await response.json() as HomePageResponse;
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

    }, [setIsLinked, setIsLoggedIn, setMapData, setPlayer]);

    return (
        <div className={"flex flex-col items-center justify-center gap-10"}>
            <p className={"text-3xl font-bold"}>Geo Stats - Your Stats for Geo Guessr</p>
            <div>
                <div className={"flex flex-row justify-between mb-1"}>
                    <SelectDataFormat dataFormat={dataFormat} setDataFormat={setDataFormat}/>
                    <SelectGameModes gameMode={gameMode} setGameMode={setGameMode}/>
                    <SelectTime time={time} setTime={setTime}/>
                </div>
                <GeoGuessrMap mapData={mapData} dataFormat={dataFormat}/>
            </div>
        </div>
    );
}

export default HomePage;