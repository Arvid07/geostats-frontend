import {ThemeProvider} from "@/components/ThemeProvider.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "@/router/sign-in/LoginPage.tsx";
import SignUpPage from "@/router/sign-in/SignUpPage.tsx";
import CountriesPage from "@/router/countries-page/CountriesPage.tsx";
import * as React from "react";
import {useState} from "react";
import HomePage from "@/router/home-page/HomePage.tsx";
import {
    DataFormat,
    type MapData,
    type Player,
    type PlayerStats,
    TeamGameMode,
    Time
} from "@/Components.ts";
import data from "@/router/home-page/map/data.json";
import CountryPage from "@/router/country-page/CountryPage.tsx";

interface ContextType {
    dataFormat: DataFormat;
    setDataFormat: React.Dispatch<React.SetStateAction<DataFormat>>;
    gameMode: TeamGameMode;
    setGameMode: React.Dispatch<React.SetStateAction<TeamGameMode>>;
    time: Time;
    setTime: React.Dispatch<React.SetStateAction<Time>>;
    playerStats: null | PlayerStats;
    setPlayerStats: React.Dispatch<React.SetStateAction<null | PlayerStats>>;
    mapData: MapData | null;
    setMapData: React.Dispatch<React.SetStateAction<MapData | null>>;
    isLoggedIn: boolean | null;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
    isLinked: boolean | null;
    setIsLinked: React.Dispatch<React.SetStateAction<boolean | null>>;
    player: Player | null;
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
    countries: Map<string, string>
}

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line
export const Context = React.createContext<ContextType>();

function App() {
    const [dataFormat, setDataFormat] = useState(DataFormat.Absolute);
    const [gameMode, setGameMode] = useState(TeamGameMode.DuelsRanked);
    const [time, setTime] = useState(Time.AllTime);
    const [playerStats, setPlayerStats] = useState<null | PlayerStats>(null);
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isLinked, setIsLinked] = useState<boolean | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);

    const countries: Map<string, string> = new Map(
        data
            .filter(country => country.id != null && country.fill !== "url(#striped-pattern)")
            .map(raw => [raw.id!, raw.region!] as [string, string])
    );

    return (
        <Context.Provider value={{
            dataFormat, setDataFormat,
            gameMode, setGameMode,
            time, setTime,
            playerStats, setPlayerStats,
            mapData, setMapData,
            isLoggedIn, setIsLoggedIn,
            isLinked, setIsLinked,
            player, setPlayer,
            countries
        }}>
            <div className={"font-geist"}>
                <ThemeProvider defaultTheme={"dark"} storageKey={"vite-ui-theme"}>
                    <BrowserRouter>
                        <Routes>
                            <Route path={"/"} element={<HomePage/>}/>
                            <Route path={"/login"} element={<LoginPage/>}/>
                            <Route path={"/signup"} element={<SignUpPage/>}/>
                            <Route path={"/countries"} element={<CountriesPage/>}/>
                            <Route path={"/countries/:countryCode"} element={<CountryPage/>}/>
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </div>
        </Context.Provider>

    );
}

export default App