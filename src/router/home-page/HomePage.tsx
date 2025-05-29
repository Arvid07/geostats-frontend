import GeoGuessrMap from "@/router/home-page/map/GeoGuessrMap.tsx";
import {useContext, useEffect} from "react";
import SelectDataFormat from "@/router/home-page/components/DataFormat.tsx";
import SelectGameModes from "@/router/home-page/components/SelectGameModes.tsx";
import SelectTime from "@/router/home-page/components/SelectTime.tsx";
import {Time} from "@/Components.ts";
import {setMapDataFromResponse} from "@/router/home-page/utils.ts";
import {Context} from "@/App.tsx";
import ContainerPage from "@/router/ContainerPage.tsx";
import {makePlayerStatsRequest} from "@/router/utils.ts";

function HomePage() {
    const {
        playerStats,
        setPlayerStats,
        time,
        setMapData,
        gameMode,
        setIsLoggedIn,
        setIsLinked,
        setPlayer
    } = useContext(Context);

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
                    setMapDataFromResponse(setMapData, playerStats, gameMode, getMonday());
                    break;
                case Time.Last7Days:
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
        makePlayerStatsRequest(setIsLoggedIn, setIsLinked, setPlayerStats, setPlayer);
    }, [setIsLinked, setIsLoggedIn, setPlayer, setPlayerStats]);

    return (
        <ContainerPage>
            <div className={"flex flex-col items-center justify-center gap-10 h-full"}>
                <p className={"text-3xl font-bold"}>Geo Stats - Your Stats for Geo Guessr</p>
                <div>
                    <div className={"flex flex-row justify-between mb-1"}>
                        <SelectDataFormat/>
                        <SelectGameModes/>
                        <SelectTime/>
                    </div>
                    <GeoGuessrMap/>
                </div>
            </div>
        </ContainerPage>
    );
}

export default HomePage;