import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {TeamGameMode} from "@/router/home-page/Components.ts";
import * as React from "react";

interface Props {
    gameMode: TeamGameMode;
    setGameMode: React.Dispatch<React.SetStateAction<TeamGameMode>>;
}

export function SelectGameModes({ gameMode, setGameMode }: Props) {
    return (
        <Select
            value={gameMode}
            onValueChange={(value) => {
                setGameMode(value as TeamGameMode);
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder={"Game Mode"}/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Game Mode</SelectLabel>
                    <SelectItem value={TeamGameMode.DuelsRanked}>Competitive Duels</SelectItem>
                    <SelectItem value={TeamGameMode.Duels}>Duels</SelectItem>
                    <SelectItem value={TeamGameMode.TeamDuelsRanked}>Competitive Team Duels</SelectItem>
                    <SelectItem value={TeamGameMode.TeamDuels}>Team Duels</SelectItem>
                    <SelectItem value={TeamGameMode.Ranked}>Competitive</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectGameModes;