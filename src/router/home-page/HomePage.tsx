import GeoGuessrMap from "@/router/home-page/map/GeoGuessrMap.tsx";
import {useContext, useEffect} from "react";
import SelectDataFormat from "@/router/home-page/components/DataFormat.tsx";
import SelectGameModes from "@/router/home-page/components/SelectGameModes.tsx";
import SelectTime from "@/router/home-page/components/SelectTime.tsx";
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

    useEffect(() => {
        if (playerStats) {
            setMapDataFromResponse(setMapData, playerStats, gameMode, time);
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