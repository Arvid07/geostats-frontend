import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import { DataFormat } from "@/Components.ts";
import {useContext} from "react";
import {Context} from "@/App.tsx";

export function SelectDataFormat() {
    const {
        dataFormat,
        setDataFormat
    } = useContext(Context);

    return (
        <Select
            value={dataFormat}
            onValueChange={(value) => {
                setDataFormat(value as DataFormat);
            }}
        >
            <SelectTrigger>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Data Format</SelectLabel>
                    <SelectItem value={DataFormat.Absolute}>Absolute</SelectItem>
                    <SelectItem value={DataFormat.Damage}>Damage</SelectItem>
                    <SelectItem value={DataFormat.Country}>Country</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectDataFormat;