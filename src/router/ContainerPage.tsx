import {Separator} from "@/components/ui/separator.tsx";
import {type ReactNode, useContext} from "react";
import UserAvatar from "@/router/components/UserAvatar.tsx";
import {Context} from "@/App.tsx";

interface ContainerPageProps {
    children: ReactNode;
}

function ContainerPage({ children }: ContainerPageProps) {
    const {
        isLoggedIn,
        isLinked,
        player
    } = useContext(Context);

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
                    <img className={"h-fit mr-3"} src={"/vite.svg"} alt={"icon"}/>
                    <p className={"text-2xl"}>Geo Stats</p>
                </div>
                <UserAvatar isLoggedIn={isLoggedIn} player={player}/>
            </div>
            <Separator/>
            {children}
        </div>
    );
}

export default ContainerPage;