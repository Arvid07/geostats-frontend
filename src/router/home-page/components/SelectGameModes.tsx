import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {TeamGameMode} from "@/Components.ts";
import {useContext} from "react";
import {Context} from "@/App.tsx";

export function SelectGameModes() {
    const {
        gameMode,
        setGameMode
    } = useContext(Context);

    return (
        <Select
            value={gameMode}
            onValueChange={(value) => {
                setGameMode(value as TeamGameMode);
            }}
        >
            <SelectTrigger>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Game Mode</SelectLabel>
                    <SelectItem value={TeamGameMode.DuelsRanked}>Competitive Duels</SelectItem>
                    <SelectItem value={TeamGameMode.Duels}>Duels</SelectItem>
                    <SelectItem value={TeamGameMode.TeamDuelsRanked}>Competitive Team Duels</SelectItem>
                    <SelectItem value={TeamGameMode.TeamDuels}>Team Duels</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectGameModes;