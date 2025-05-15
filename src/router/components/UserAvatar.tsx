import type {Player} from "@/router/ContainerPage.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useEffect, useState} from "react";
import * as React from "react";
import EditPlayerId from "@/router/components/EditPlayerId.tsx";
import {CircleCheck, CircleX, LogOut} from "lucide-react";

interface Props {
    isLoggedIn: boolean | null;
    player: Player | null;
}

const AVATAR_PLACEHOLDER = "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg";

function UserAvatar({ isLoggedIn, player}: Props) {
    const navigate = useNavigate();
    const [profileUrl, setProfileUrl] = useState(AVATAR_PLACEHOLDER);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!player) {
            setProfileUrl(AVATAR_PLACEHOLDER);
            return;
        }

        setProfileUrl("https://www.geoguessr.com/images/resize:auto:96:96/gravity:ce/plain/" + player.avatarPin);
    }, [player]);

    useEffect(() => {
        setErrorMessage(null);
    }, [isDialogOpen]);

    if (isLoggedIn == null) {
        return null;
    }

    if (!isLoggedIn) {
        return <Button onClick={() => navigate("/login")}>Sign in</Button>;
    }

    function handleEditAccountLink(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (buttonDisabled) {
            return;
        }

        setButtonDisabled(true);

        const form = event.currentTarget;
        const data = new FormData(form);
        const playerId = data.get("playerId") as string;

        fetch("http://localhost:8080/link-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ playerId: playerId })
        }).then(async (response) => {
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            navigate("/");
            window.location.reload();
        }).catch((err: Error) => {
            setErrorMessage(err.message);
        }).finally(() => {
            setButtonDisabled(false);
        });
    }

    function handleLogOut() {
        if (buttonDisabled) {
            return;
        }

        setButtonDisabled(true);

        fetch("http://localhost:8080/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(async (response) => {
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            navigate("/");
            window.location.reload();
        }).catch((err: Error) => {
            setErrorMessage(err.message);
        }).finally(() => {
            setButtonDisabled(false);
        });
    }

    function showErrorMessage() {
        if (!errorMessage) {
            return null;
        }

        return (
            <p className={"text-red-600 italic mt-3"}>{errorMessage}</p>
        );
    }

    function getAccountLinkMessage() {
        if (!player) {
            return <><CircleX color={"red"}/>Account Linked</>;
        } else {
            return <><CircleCheck color={"green"}/>Account Linked</>;
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className={"hover:ring-2 hover:ring-blue-500"}>
                        <AvatarImage src={profileUrl} alt={"PP"}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent className={"w-56"}>
                    <DropdownMenuLabel>
                        <div className={"flex flex-col items-center justify-center gap-3"}>
                            <div className={"flex items-center justify-center py-6"}>
                                <img
                                    src={profileUrl}
                                    alt={"Profile Picture"}
                                    className={""}
                                />
                                {player && <img
                                    src={"https://www.geoguessr.com/static/avatars/tiers/low-quality/tier-70.webp"}
                                    alt={"Profile Background"}
                                    className={"absolute"}
                                />}
                            </div>
                            <p>{player?.name}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        {getAccountLinkMessage()}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={handleLogOut}>
                        <><LogOut/> Log out</>

                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditPlayerId
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                handleEditAccountLink={handleEditAccountLink}
                playerId={player?.id}
                buttonDisabled={buttonDisabled}
                showErrorMessage={showErrorMessage}
            />
        </>
    );
}

export default UserAvatar;