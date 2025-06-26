import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useContext} from "react";
import {Context} from "@/App.tsx";
import { GameMode } from "@/Components";

export function SelectGameModes() {
    const {
        gameMode,
        setGameMode
    } = useContext(Context);

    return (
        <Select
            value={gameMode}
            onValueChange={(value) => {
                setGameMode(value as GameMode);
            }}
        >
            <SelectTrigger>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Game Mode</SelectLabel>
                    <SelectItem value={GameMode.DuelsRanked}>Competitive Duels</SelectItem>
                    <SelectItem value={GameMode.Duels}>Duels</SelectItem>
                    <SelectItem value={GameMode.TeamDuelsRanked}>Competitive Team Duels</SelectItem>
                    <SelectItem value={GameMode.TeamDuels}>Team Duels</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectGameModes;