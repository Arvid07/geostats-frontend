import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import * as React from "react";
import { DataFormat } from "../Components.ts";

interface Props {
    dataFormat: DataFormat;
    setDataFormat: React.Dispatch<React.SetStateAction<DataFormat>>;
}

export function SelectDataFormat({ dataFormat, setDataFormat }: Props) {
    return (
        <Select
            value={dataFormat}
            onValueChange={(value) => {
                setDataFormat(value as DataFormat);
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder={"Data format"}/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Data Format</SelectLabel>
                    <SelectItem value={DataFormat.Absolute}>Absolute</SelectItem>
                    <SelectItem value={DataFormat.RelativeEnemy}>Relative to Enemy</SelectItem>
                    <SelectItem value={DataFormat.RelativeCountry}>Relative to Country</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectDataFormat;