import * as React from "react";
import {useEffect, useState} from "react";
import FilterCountries from "@/router/countries-page/components/FilterCountries.tsx";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {RegionStats, RegionStatsWrapper, SubdivisionFullStats, SubdivisionStatsWrapper} from "@/router/country-page/utils.ts";
import {getAverageStats, type HeaderColumn, Key, SortingDirection, sortRegionStats, sortSubdivisionStats, type SubdivisionInfo} from "@/router/country-page/components/utils.ts";
import CustomizeData, {DataView} from "@/router/countries-page/components/CustomizeData.tsx";
import type {AverageStats} from "@/Components.ts";
import DataTableRow from "@/router/country-page/components/DataTableRow.tsx";
import {Style} from "@/router/country-page/components/Components.ts";

interface Props {
    regions: Map<string, string[]> | null;
    regionStatsMap: Map<string, SubdivisionFullStats>;
    subdivisions: Map<string, SubdivisionInfo> | null;
    subdivisionStatsMap: Map<string, SubdivisionFullStats>;
    countryCode: string | undefined;
    dataView: Set<DataView>;
    setDataView: React.Dispatch<React.SetStateAction<Set<DataView>>>;
}

export const NO_DATA = -Infinity;
const DEFAULT_SORTED_BY = Key.Name;
const DEFAULT_SORTING_DIRECTION = SortingDirection.Ascending;

function DataTable({regions, regionStatsMap, subdivisions, subdivisionStatsMap, countryCode, dataView, setDataView}: Props) {
    const [sortedBy, setSortedBy] = useState(DEFAULT_SORTED_BY);
    const [sortingDirection, setSortingDirection] = useState(DEFAULT_SORTING_DIRECTION);
    const [subdivisionFilter, setSubdivisionFilter] = useState("");
    const [selectedColumns, setSelectedColumns] = useState(new Set(Object.values(Key).filter(key => !key.includes("Enemy"))));
    const [subdivisionStats, setSubdivisionStats] = useState<SubdivisionStatsWrapper | RegionStatsWrapper | null>(null);
    const [averageStats, setAverageStats] = useState<AverageStats | null>(null);
    const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set<string>());

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
        if (!dataView.has(DataView.Region)) {
            if (!subdivisions) {
                return;
            }

            const subdivisionStats = [];

            for (const [subdivisionId, info] of subdivisions) {
                let subdivisionStat = subdivisionStatsMap.get(subdivisionId);

                if (!subdivisionStat) {
                    subdivisionStat = {
                        id: subdivisionId,
                        name: info.name,
                        region: info.region,
                        averagePoints: NO_DATA,
                        averageEnemyPoints: NO_DATA,
                        averageDamage: NO_DATA,
                        hitRate: NO_DATA,
                        enemyHitRate: NO_DATA,
                        count: 0
                    };
                }

                subdivisionStats.push(subdivisionStat);
            }

            sortSubdivisionStats(subdivisionStats, sortedBy, sortingDirection);

            setSubdivisionStats({stats: subdivisionStats});
        } else {
            if (!regions || !subdivisions) {
                return;
            }

            const regionStats: RegionStats[] = [];

            for (const [regionId, subdivisionIds] of regions) {
                const subdivisionStats = [];
                
                for (const subdivisionId of subdivisionIds) {
                    const subdivisionInfo = subdivisions.get(subdivisionId)!;
                    let subdivisionStat = subdivisionStatsMap.get(subdivisionId);

                    if (!subdivisionStat) {
                        subdivisionStat = {
                            id: subdivisionId,
                            name: subdivisionInfo.name,
                            region: subdivisionInfo.region,
                            averagePoints: NO_DATA,
                            averageEnemyPoints: NO_DATA,
                            averageDamage: NO_DATA,
                            hitRate: NO_DATA,
                            enemyHitRate: NO_DATA,
                            count: 0
                        };
                    }

                    subdivisionStats.push(subdivisionStat);
                }

                sortSubdivisionStats(subdivisionStats, sortedBy, sortingDirection);

                let average = regionStatsMap.get(regionId);

                if (!average) {
                    average = {
                        id: regionId,
                        name: regionId,
                        region: "",
                        hitRate: NO_DATA,
                        enemyHitRate: NO_DATA,
                        averagePoints: NO_DATA,
                        averageEnemyPoints: NO_DATA,
                        averageDamage: NO_DATA,
                        count: 0
                    };
                }
                
                regionStats.push({
                    average: average,
                    subdivisions: subdivisionStats
                });
            }

            sortRegionStats(regionStats, sortedBy, sortingDirection);

            setSubdivisionStats({regionStats: regionStats});
        }
    }, [dataView, regionStatsMap, regions, subdivisionStatsMap, subdivisions]);

    useEffect(() => {
        setSubdivisionStats((subdivisionStats) => {
            if (!subdivisionStats) {
                return null;
            }

            if ("stats" in subdivisionStats) {
                const newStats = [...subdivisionStats.stats];

                sortSubdivisionStats(newStats, sortedBy, sortingDirection);

                return { ...subdivisionStats, stats: newStats};
            } else {
                const newRegionStats: RegionStats[] = [];

                for (const regionStats of subdivisionStats.regionStats) {
                    const newSubdivisionStats = [...regionStats.subdivisions];
                    sortSubdivisionStats(newSubdivisionStats, sortedBy, sortingDirection);

                    newRegionStats.push({ ...regionStats, subdivisions: newSubdivisionStats});
                }

                sortRegionStats(newRegionStats, sortedBy, sortingDirection);

                return { ...subdivisionStats, regionStats: newRegionStats};
            }
        });
    }, [sortedBy, sortingDirection]);

    useEffect(() => {
        if (!subdivisionStats) {
            return;
        }

        if ("stats" in subdivisionStats) {
            setAverageStats(getAverageStats(
                subdivisionStats.stats.filter((subdivision) =>
                    subdivision.name.toLowerCase().includes(subdivisionFilter.toLowerCase()))
            ));
        } else {
            setAverageStats(getAverageStats(
                subdivisionStats.regionStats
                    .filter((region) => region.average.name.toLowerCase().includes(subdivisionFilter.toLowerCase()))
                    .map((region) => region.average)
            ));
        }
    }, [subdivisionFilter, subdivisionStats]);

    function getStats(subdivisionStats: SubdivisionStatsWrapper | RegionStatsWrapper) {
        if ("stats" in subdivisionStats) {
            return subdivisionStats.stats;
        } else {
            return subdivisionStats?.regionStats;
        }
    }

    return (
        <div className={"flex flex-col justify-center"}>
            <div className={"flex flex-row justify-between"}>
                <FilterCountries countryFilter={subdivisionFilter} setCountryFilter={setSubdivisionFilter} placeholder={"Search for Subdivisions..."}/>
                <CustomizeData
                    setSelectedColumns={setSelectedColumns}
                    selectedColumns={selectedColumns}
                    e={Key}
                    includeSolo={true}
                    dataView={dataView}
                    setDataView={setDataView}
                />
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
                    {subdivisionStats && getStats(subdivisionStats)
                        .map((subdivision) => {
                            if (!("average" in subdivision)) {
                                if (!subdivision.name.toLowerCase().includes(subdivisionFilter.toLowerCase())) {
                                    return null;
                                }

                                return (
                                    <DataTableRow subdivisionStats={subdivision} selectedColumns={selectedColumns} countryCode={countryCode} style={Style.Subdivision}/>
                                );
                            } else {
                                return (
                                    <React.Fragment>
                                        <DataTableRow
                                            subdivisionStats={subdivision.average}
                                            selectedColumns={selectedColumns}
                                            countryCode={countryCode}
                                            style={Style.Region}
                                            selectedRegions={selectedRegions}
                                            setSelectedRegions={setSelectedRegions}
                                        />
                                        {selectedRegions?.has(subdivision.average.id) && subdivision.subdivisions.map((subdivisionRegion) => {
                                            if (!subdivisionRegion.name.toLowerCase().includes(subdivisionFilter.toLowerCase())) {
                                                return null;
                                            }

                                            return (
                                                <DataTableRow subdivisionStats={subdivisionRegion} selectedColumns={selectedColumns} countryCode={countryCode} style={Style.Subdivision}/>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            }
                        })}
                </TableBody>
                <TableFooter className={"sticky bottom-0"}>
                    {averageStats &&
                        <TableRow key={"total"}>
                            <TableCell hidden={!selectedColumns.has(Key.Name)} className={"flex flex-row items-center gap-2"}>
                                Total
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.HitRate)} className={"pl-6"}>
                                {averageStats.hitRate !== NO_DATA ? averageStats.hitRate + "%" : "-"}
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.EnemyHitRate)} className={"pl-6"}>
                                {averageStats.enemyHitRate !== NO_DATA ? averageStats.enemyHitRate + "%" : "-"}
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.AveragePoints)} className={"pl-6"}>
                                {averageStats.averagePoints !== NO_DATA ? averageStats.averagePoints : "-"}
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.AverageEnemyPoints)} className={"pl-6"}>
                                {averageStats.averageEnemyPoints !== NO_DATA ? averageStats.averageEnemyPoints : "-"}
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.AverageDamage)} className={"pl-6"}>
                                {averageStats.averageDamage !== NO_DATA ? averageStats.averageDamage : "-"}
                            </TableCell>
                            <TableCell hidden={!selectedColumns.has(Key.Count)} className={"text-right pr-6"}>
                                {averageStats.count}
                            </TableCell>
                        </TableRow>
                    }
                </TableFooter>
            </Table>
        </div>
    );
}

export default DataTable;