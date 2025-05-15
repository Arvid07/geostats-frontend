import HomePage from "@/router/home-page/HomePage.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {useState} from "react";
import UserAvatar from "@/router/components/UserAvatar.tsx";

export interface Player {
    id: string;
    name: string;
    countryCode: string;
    avatarPin: string;
    level: number;
    isProUser: boolean;
    isCreator: boolean;
    rating?: number | null;
    movingRating?: number | null;
    noMoveRating?: number | null;
    nmpzRating?: number | null;
}

function ContainerPage() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isLinked, setIsLinked] = useState<boolean | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);

    function getWarningMessage() {
        if (isLoggedIn && isLinked != null && !isLinked) {
            return (
                <div className={"flex items-center justify-center w-full bg-red-700"}>
                    <p>It looks like your account is not linked yet. Link your account in the profile section to unlock all features.</p>
                </div>
            );
        }

        return null;
    }

    return (
        <div className={"flex flex-col w-full h-screen"}>
            {getWarningMessage()}
            <div className={"flex flex-row w-full items-center justify-between p-4 px-6"}>
                <div className={"flex flex-row items-center justify-center"}>
                    <img className={"h-fit mr-3"} src={"public/vite.svg"} alt={"icon"}/>
                    <p className={"text-2xl"}>Geo Stats</p>
                </div>
                <UserAvatar isLoggedIn={isLoggedIn} player={player}/>
            </div>
            <Separator/>
            <div className={"flex items-center justify-center h-full"}>
                <HomePage
                    setPlayer={setPlayer}
                    setIsLoggedIn={setIsLoggedIn}
                    setIsLinked={setIsLinked}
                />
            </div>
        </div>
    );
}

export default ContainerPage;