import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Time} from "@/router/home-page/Components.ts";
import * as React from "react";

interface Props {
    time: Time;
    setTime: React.Dispatch<React.SetStateAction<Time>>;
}


export function SelectTime({ time, setTime }: Props) {
    return (
        <Select
            value={time}
            onValueChange={(value) => {
                setTime(value as Time);
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder={"Time"}/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Time</SelectLabel>
                    <SelectItem value={Time.AllTime}>All Time</SelectItem>
                    <SelectItem value={Time.ThisWeek}>This Week</SelectItem>
                    <SelectItem value={Time.Last7Days}>Last 7 days</SelectItem>
                    <SelectItem value={Time.Last30Days}>Last 30 days</SelectItem>
                    <SelectItem value={Time.LastYear}>Last Year</SelectItem>
                    <SelectItem value={Time.Custom}>Custom</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectTime;