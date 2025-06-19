import {useContext, useEffect, useState} from "react";
import {type AverageStats} from "@/Components.ts";
import FilterCountries from "@/router/countries-page/components/FilterCountries.tsx";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {SubdivisionAdvancedStatsWithId} from "@/router/country-page/utils.ts";
import {getAverageStats, SortingDirection, sortSubdivisionStats, type HeaderColumn, getProcessedStats, type SubdivisionInfo, Key} from "@/router/country-page/components/utils.ts";
import {Context} from "@/App.tsx";
import type {StatsGuess, TeamStatsGuess} from "./Components";
import CustomizeData from "@/router/countries-page/components/CustomizeData.tsx";

interface Props {
    rawGameModeStats: StatsGuess[] | TeamStatsGuess[] | null;
    subdivisions: Map<string, SubdivisionInfo> | null;
    countryCode: string | undefined;
}

export const AVERAGE_STATS_ID = "ALL";
export const NO_DATA = -Infinity;
const DEFAULT_SORTED_BY = Key.Name;
const DEFAULT_SORTING_DIRECTION = SortingDirection.Ascending;

function DataTable({rawGameModeStats, subdivisions, countryCode}: Props) {
    const [subdivisionStats, setSubdivisionStats] = useState<SubdivisionAdvancedStatsWithId[] | null>(null);
    const [subdivisionEnemyStats, setSubdivisionEnemyStats] = useState<SubdivisionAdvancedStatsWithId[] | null>(null);
    const [averageStats, setAverageStats] = useState<AverageStats | null>(null);
    const [sortedBy, setSortedBy] = useState(DEFAULT_SORTED_BY);
    const [sortingDirection, setSortingDirection] = useState(DEFAULT_SORTING_DIRECTION);
    const [subdivisionFilter, setSubdivisionFilter] = useState("");
    const [selectedColumns, setSelectedColumns] = useState(new Set(Object.values(Key).filter(key => !key.includes("Enemy"))));

    const {
        time
    } = useContext(Context);

    const headerColumns: HeaderColumn[] = [];

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Ascending,
        key: Key.Name
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.HitRate
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.EnemyHitRate
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AveragePoints
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageEnemyPoints
    });

    headerColumns.push({
        className: "w-25",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageDamage
    });

    headerColumns.push({
        className: "text-right",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.Count
    });

    useEffect(() => {
        setSubdivisionStats((subdivisionStats) => {
            if (!subdivisionStats) {
                return null;
            }

            const newSubdivisionStats = [...subdivisionStats];
            sortSubdivisionStats(newSubdivisionStats, sortedBy, sortingDirection);

            return newSubdivisionStats;
        });
    }, [sortedBy, sortingDirection]);

    useEffect(() => {
        if (!rawGameModeStats || !subdivisions) {
            return;
        }

        const processedStats = getProcessedStats(rawGameModeStats, subdivisions, time);
        sortSubdivisionStats(processedStats.stats, DEFAULT_SORTED_BY, DEFAULT_SORTING_DIRECTION);

        setAverageStats(getAverageStats(processedStats.stats, processedStats.enemyStats));
        setSubdivisionStats(processedStats.stats);
        setSubdivisionEnemyStats(processedStats.enemyStats);
    }, [rawGameModeStats, subdivisions, time]);

    useEffect(() => {
        if (!subdivisionStats || !subdivisionEnemyStats) {
            return;
        }

        setAverageStats(getAverageStats(
            subdivisionStats.filter((subdivision) =>
                subdivision.name.toLowerCase().includes(subdivisionFilter) ||
                subdivision.region.toLowerCase().includes(subdivisionFilter)),
            subdivisionEnemyStats.filter((subdivision) =>
                subdivision.name.toLowerCase().includes(subdivisionFilter) ||
                subdivision.region.toLowerCase().includes(subdivisionFilter))
        ));
    }, [subdivisionEnemyStats, subdivisionFilter, subdivisionStats]);

    return (
        <div className={"flex flex-col justify-center"}>
            <div className={"flex flex-row justify-between"}>
                <FilterCountries countryFilter={subdivisionFilter} setCountryFilter={setSubdivisionFilter} placeholder={"Search for States, Regions..."}/>
                <CustomizeData setSelectedColumns={setSelectedColumns} selectedColumns={selectedColumns} e={Key}/>
            </div>
            <Table className={"border-separate border-spacing-0 text-base relative"}>
                <TableHeader>
                    <TableRow className={"sticky top-0 hover:bg-muted-0 bg-card"}>
                        {headerColumns
                            .filter((headerColumn) => selectedColumns.has(headerColumn.key))
                            .map((headerColumn) => (
                                <TableHead className={headerColumn.className}>
                                    <Button
                                        variant={sortedBy === headerColumn.key ? "secondary" : "ghost"}
                                        onClick={() => {
                                            if (headerColumn.key === sortedBy) {
                                                setSortingDirection((oldSortingDirection) => oldSortingDirection * -1);
                                            } else {
                                                setSortedBy(headerColumn.key);
                                                setSortingDirection(headerColumn.defaultSortingDirection);
                                            }
                                        }}>
                                        {headerColumn.key}
                                    </Button>
                                </TableHead>
                            ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subdivisionStats && subdivisionStats
                        .filter((subdivision) =>
                            subdivision.name.toLowerCase().includes(subdivisionFilter) ||
                            subdivision.region.toLowerCase().includes(subdivisionFilter))
                        .map((subdivision) => (
                            <TableRow key={subdivision.id}>
                                {selectedColumns.has(Key.Name) &&
                                    <TableCell className={"flex flex-row items-center gap-2"}>
                                        <img
                                            className={"w-8"}
                                            src={`https://raw.githubusercontent.com/amckenna41/iso3166-flag-icons/20ca9f16a84993a89cedd1238e4363bd50175d87/iso3166-2-icons/${countryCode?.toUpperCase()}/${subdivision.id}.svg`}
                                            alt={`${subdivision.name} Flag`}
                                        />
                                        {subdivision.name}
                                    </TableCell>
                                }
                                {selectedColumns.has(Key.HitRate) &&
                                    <TableCell className={"pl-6"}>{subdivision.hitRate !== NO_DATA ? subdivision.hitRate + "%" : "-"}</TableCell>
                                }
                                {selectedColumns.has(Key.EnemyHitRate) &&
                                    <TableCell className={"pl-6"}>{subdivision.enemyHitRate !== NO_DATA ? subdivision.enemyHitRate + "%" : "-"}</TableCell>
                                }
                                {selectedColumns.has(Key.AveragePoints) &&
                                    <TableCell className={"pl-6"}>{subdivision.averagePoints !== NO_DATA ? subdivision.averagePoints : "-"}</TableCell>
                                }
                                {selectedColumns.has(Key.AverageEnemyPoints) &&
                                    <TableCell className={"pl-6"}>{subdivision.averageEnemyPoints !== NO_DATA ? subdivision.averageEnemyPoints : "-"}</TableCell>
                                }
                                {selectedColumns.has(Key.AverageDamage) &&
                                    <TableCell className={"pl-6"}>{subdivision.averageDamage !== NO_DATA ? subdivision.averageDamage : "-"}</TableCell>
                                }
                                {selectedColumns.has(Key.Count) &&
                                    <TableCell className={"text-right pr-6"}>{subdivision.count}</TableCell>
                                }
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter className={"sticky bottom-0"}>
                    {averageStats &&
                        <TableRow key={"total"}>
                            {selectedColumns.has(Key.Name) &&
                                <TableCell className={"flex flex-row items-center gap-2"}>Total</TableCell>
                            }
                            {selectedColumns.has(Key.HitRate) &&
                                <TableCell className={"pl-6"}>{averageStats.hitRate !== NO_DATA ? averageStats.hitRate + "%" : "-"}</TableCell>
                            }
                            {selectedColumns.has(Key.EnemyHitRate) &&
                                <TableCell className={"pl-6"}>{averageStats.enemyHitRate !== NO_DATA ? averageStats.enemyHitRate + "%" : "-"}</TableCell>
                            }
                            {selectedColumns.has(Key.AveragePoints) &&
                                <TableCell className={"pl-6"}>{averageStats.averagePoints !== NO_DATA ? averageStats.averagePoints : "-"}</TableCell>
                            }
                            {selectedColumns.has(Key.AverageEnemyPoints) &&
                                <TableCell className={"pl-6"}>{averageStats.averageEnemyPoints !== NO_DATA ? averageStats.averageEnemyPoints : "-"}</TableCell>
                            }
                            {selectedColumns.has(Key.AverageDamage) &&
                                <TableCell className={"pl-6"}>{averageStats.averageDamage !== NO_DATA ? averageStats.averageDamage : "-"}</TableCell>
                            }
                            {selectedColumns.has(Key.Count) &&
                                <TableCell className={"text-right pr-6"}>{averageStats.count}</TableCell>
                            }
                        </TableRow>
                    }
                </TableFooter>
            </Table>
        </div>
    );
}

export default DataTable;