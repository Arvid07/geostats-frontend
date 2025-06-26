import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Key} from "@/router/country-page/components/utils.ts";
import {NO_DATA} from "@/router/country-page/components/DataTable.tsx";
import type {SubdivisionFullStats} from "@/router/country-page/utils.ts";
import {Style} from "@/router/country-page/components/Components.ts";
import {ChevronDownIcon, ChevronRightIcon} from "lucide-react";
import * as React from "react";

interface Props {
    subdivisionStats: SubdivisionFullStats;
    selectedColumns: Set<Key>;
    countryCode: string | undefined;
    style: Style;
    selectedRegions?: Set<string>;
    setSelectedRegions?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function DataTableRow({subdivisionStats, selectedColumns, countryCode, style, selectedRegions, setSelectedRegions}: Props) {
    function handleOnRegionClick() {
        if (!selectedRegions || !setSelectedRegions) {
            return;
        }

        const newSelectedRegions = new Set(selectedRegions);

        if (selectedRegions.has(subdivisionStats.name)) {
            newSelectedRegions.delete(subdivisionStats.name);
        } else {
            newSelectedRegions.add(subdivisionStats.name);
        }

        setSelectedRegions(newSelectedRegions);
    }

    return (
        <TableRow key={subdivisionStats.id}>
            {style === Style.Subdivision &&
                <TableCell hidden={!selectedColumns.has(Key.Name)} className={"flex flex-row items-center gap-2"}>
                    <img
                        className={"w-8"}
                        src={`/flags/subdivisions/${countryCode?.toUpperCase()}/${subdivisionStats.id}.svg`}
                        alt={`${subdivisionStats.name} Flag`}
                    />
                    {subdivisionStats.name}
                </TableCell>
            }
            {style === Style.Region &&
                <TableCell
                    hidden={!selectedColumns.has(Key.Name)}
                    className={"flex flex-row items-center gap-2"}
                    onClick={handleOnRegionClick}
                >
                    {selectedRegions?.has(subdivisionStats.id) ? <ChevronDownIcon color={"#A1A1A1"}/> : <ChevronRightIcon color={"#A1A1A1"}/>}
                    {subdivisionStats.name}
                </TableCell>
            }
            <TableCell hidden={!selectedColumns.has(Key.HitRate)} className={"pl-6"}>
                {subdivisionStats.hitRate !== NO_DATA ? subdivisionStats.hitRate + "%" : "-"}
            </TableCell>
            <TableCell hidden={!selectedColumns.has(Key.EnemyHitRate)} className={"pl-6"}>
                {subdivisionStats.enemyHitRate !== NO_DATA ? subdivisionStats.enemyHitRate + "%" : "-"}
            </TableCell>
            <TableCell hidden={!selectedColumns.has(Key.AveragePoints)} className={"pl-6"}>
                {subdivisionStats.averagePoints !== NO_DATA ? subdivisionStats.averagePoints : "-"}
            </TableCell>
            <TableCell hidden={!selectedColumns.has(Key.AverageEnemyPoints)} className={"pl-6"}>
                {subdivisionStats.averageEnemyPoints !== NO_DATA ? subdivisionStats.averageEnemyPoints : "-"}
            </TableCell>
            <TableCell hidden={!selectedColumns.has(Key.AverageDamage)} className={"pl-6"}>
                {subdivisionStats.averageDamage !== NO_DATA ? subdivisionStats.averageDamage : "-"}
            </TableCell>
            <TableCell hidden={!selectedColumns.has(Key.Count)} className={"text-right pr-6"}>
                {subdivisionStats.count}
            </TableCell>
        </TableRow>
    );
}

export default DataTableRow;