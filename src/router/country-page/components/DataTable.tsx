import * as React from "react";
import {useContext, useEffect, useState} from "react";
import FilterCountries from "@/router/countries-page/components/FilterCountries.tsx";
import {Table, TableBody, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import type {MapInfo, RegionStats, RegionStatsWrapper, SubdivisionFullStats, SubdivisionStatsWrapper} from "@/router/country-page/utils.ts";
import {getAverageStats, Key, SortingDirection, sortRegionStats, sortSubdivisionStats, type SubdivisionInfo} from "@/router/country-page/components/utils.ts";
import CustomizeData from "@/router/countries-page/components/CustomizeData.tsx";
import {GameMode, GeoMode} from "@/Components.ts";
import DataTableRow from "@/router/country-page/components/DataTableRow.tsx";
import {getDefaultColumns, getDefaultSoloColumns, getHeaderColumns, Style} from "@/router/country-page/components/Components.ts";
import {Context} from "@/App.tsx";

interface Props {
    regions: Map<string, string[]> | null;
    regionStatsMap: Map<string, SubdivisionFullStats>;
    subdivisions: Map<string, SubdivisionInfo> | null;
    subdivisionStatsMap: Map<string, SubdivisionFullStats>;
    countryCode: string | undefined;
    dataView: Set<DataView>;
    setDataView: React.Dispatch<React.SetStateAction<Set<DataView>>>;
    maps: Map<GameMode, Map<string, MapInfo>> | null;
    setMaps: React.Dispatch<React.SetStateAction<Map<GameMode, Map<string, MapInfo>> | null>>;
    geoMode: GeoMode;
    setGeoMode: React.Dispatch<React.SetStateAction<GeoMode>>;
}

export enum DataView {
    Region = "Region",
    Guess = "Guess"
}

export const NO_DATA = -Infinity;
const DEFAULT_SORTED_BY = Key.Name;
const DEFAULT_SORTING_DIRECTION = SortingDirection.Ascending;

function DataTable({regions, regionStatsMap, subdivisions, subdivisionStatsMap, countryCode, dataView, setDataView, maps, setMaps, geoMode, setGeoMode}: Props) {
    const [sortedBy, setSortedBy] = useState(DEFAULT_SORTED_BY);
    const [sortingDirection, setSortingDirection] = useState(DEFAULT_SORTING_DIRECTION);
    const [subdivisionFilter, setSubdivisionFilter] = useState("");
    const [selectedColumns, setSelectedColumns] = useState(getDefaultColumns());
    const [soloSelectedColumns, setSoloSelectedColumns] = useState(getDefaultSoloColumns());
    const [subdivisionStats, setSubdivisionStats] = useState<SubdivisionStatsWrapper | RegionStatsWrapper | null>(null);
    const [averageStats, setAverageStats] = useState<SubdivisionFullStats | null>(null);
    const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set<string>());

    const {gameMode} = useContext(Context);

    const headerColumns = getHeaderColumns();

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
                        averageGuessTime: NO_DATA,
                        averageEnemyGuessTime: NO_DATA,
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
                            averageGuessTime: NO_DATA,
                            averageEnemyGuessTime: NO_DATA,
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
                        averageGuessTime: NO_DATA,
                        averageEnemyGuessTime: NO_DATA,
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
                    setSelectedColumns={gameMode !== GameMode.Solo ? setSelectedColumns : setSoloSelectedColumns}
                    selectedColumns={gameMode !== GameMode.Solo ? selectedColumns : soloSelectedColumns}
                    e={Key}
                    includeSolo={true}
                    dataView={dataView}
                    setDataView={setDataView}
                    soloColumns={getDefaultSoloColumns()}
                    maps={maps}
                    setMaps={setMaps}
                    geoMode={geoMode}
                    setGeoMode={setGeoMode}
                />
            </div>
            <Table className={"border-separate border-spacing-0 text-base relative"}>
                <TableHeader>
                    <TableRow className={"sticky top-0 hover:bg-muted-0 bg-card"}>
                        {headerColumns
                            .filter((headerColumn) =>
                                (gameMode !== GameMode.Solo && selectedColumns.has(headerColumn.key)) ||
                                (gameMode === GameMode.Solo && soloSelectedColumns.has(headerColumn.key)))
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
                                    <DataTableRow
                                        subdivisionStats={subdivision}
                                        selectedColumns={gameMode !== GameMode.Solo ? selectedColumns : soloSelectedColumns}
                                        countryCode={countryCode}
                                        style={Style.Subdivision}
                                    />
                                );
                            } else {
                                return (
                                    <React.Fragment>
                                        {subdivision.average.name.toLowerCase().includes(subdivisionFilter.toLowerCase()) &&
                                            <DataTableRow
                                                subdivisionStats={subdivision.average}
                                                selectedColumns={gameMode !== GameMode.Solo ? selectedColumns : soloSelectedColumns}
                                                countryCode={countryCode}
                                                style={Style.Region}
                                                selectedRegions={selectedRegions}
                                                setSelectedRegions={setSelectedRegions}
                                            />
                                        }
                                        {selectedRegions?.has(subdivision.average.id) && subdivision.subdivisions.map((subdivisionRegion) => {
                                            if (!subdivisionRegion.name.toLowerCase().includes(subdivisionFilter.toLowerCase())) {
                                                return null;
                                            }

                                            return (
                                                <DataTableRow
                                                    subdivisionStats={subdivisionRegion}
                                                    selectedColumns={gameMode !== GameMode.Solo ? selectedColumns : soloSelectedColumns}
                                                    countryCode={countryCode}
                                                    style={Style.Subdivision}
                                                />
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            }
                        })}
                </TableBody>
                <TableFooter className={"sticky bottom-0"}>
                    {averageStats &&
                        <DataTableRow
                            subdivisionStats={averageStats}
                            selectedColumns={gameMode !== GameMode.Solo ? selectedColumns : soloSelectedColumns}
                            countryCode={countryCode}
                            style={Style.Average}
                        />}
                </TableFooter>
            </Table>
        </div>
    );
}

export default DataTable;