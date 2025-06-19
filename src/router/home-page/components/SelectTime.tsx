import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Time} from "@/Components.ts";
import {useContext} from "react";
import {Context} from "@/App.tsx";

export function SelectTime() {
    const {
        time,
        setTime
    } = useContext(Context);

    return (
        <Select
            value={time.toString()}
            onValueChange={(value) => {
                setTime(Number(value) as Time);
            }}
        >
            <SelectTrigger>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Time</SelectLabel>
                    <SelectItem value={Time.AllTime.toString()}>All Time</SelectItem>
                    <SelectItem value={Time.ThisWeek.toString()}>This Week</SelectItem>
                    <SelectItem value={Time.Last7Days.toString()}>Last 7 days</SelectItem>
                    <SelectItem value={Time.Last30Days.toString()}>Last 30 days</SelectItem>
                    <SelectItem value={Time.LastYear.toString()}>Last Year</SelectItem>
                    <SelectItem value={Time.Custom.toString()}>Custom</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectTime;