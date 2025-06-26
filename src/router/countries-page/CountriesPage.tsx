import {Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import ContainerPage from "@/router/ContainerPage.tsx";
import {useContext, useEffect, useState} from "react";
import {Context} from "@/App.tsx";
import {type AverageStats, type CountryAdvancedStats, GameMode} from "@/Components.ts";
import {makePlayerStatsRequest} from "@/router/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {getAverageStats, getProcessedStats, type HeaderColumn, Key, sortCountryStats, SortingDirection} from "./utils";
import FilterCountries from "@/router/countries-page/components/FilterCountries.tsx";
import CustomizeData from "@/router/countries-page/components/CustomizeData.tsx";
import {useNavigate} from "react-router-dom";

export const AVERAGE_STATS_ID = "ALL";
export const NO_DATA = -Infinity;
const DEFAULT_SORTED_BY = Key.Name;
const DEFAULT_SORTING_DIRECTION = SortingDirection.Ascending;

function CountriesPage() {
    const [countryStats, setCountryStats] = useState<CountryAdvancedStats[] | null>(null);
    const [enemyCountryStats, setEnemyCountryStats] = useState<CountryAdvancedStats[] | null>(null);
    const [averageStats, setAverageStats] = useState<AverageStats | null>(null);
    const [sortedBy, setSortedBy] = useState(DEFAULT_SORTED_BY);
    const [sortingDirection, setSortingDirection] = useState(DEFAULT_SORTING_DIRECTION);
    const [countryFilter, setCountryFilter] = useState("");
    const [selectedColumns, setSelectedColumns] = useState(new Set(Object.values(Key).filter(key => !key.includes("Enemy"))));

    const navigate = useNavigate();

    const headerColumns: HeaderColumn[] = [];

    headerColumns.push({
        className: "w-60",
        defaultSortingDirection: SortingDirection.Ascending,
        key: Key.Name
    });

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.HitRate
    });

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.EnemyHitRate
    });

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AveragePoints
    });

    headerColumns.push({
        className: "text-right",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageEnemyPoints
    });

    headerColumns.push({
        className: "w-50",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.AverageDamage
    });

    headerColumns.push({
        className: "text-right",
        defaultSortingDirection: SortingDirection.Descending,
        key: Key.Count
    });

    const {
        time,
        playerStats,
        gameMode,
        countries,
        setIsLoggedIn,
        setIsLinked,
        setPlayerStats,
        setPlayer
    } = useContext(Context);

    useEffect(() => {
        makePlayerStatsRequest(setIsLoggedIn, setIsLinked, setPlayerStats, setPlayer);
    }, [setIsLinked, setIsLoggedIn, setPlayer, setPlayerStats]);

    useEffect(() => {
        if (!playerStats) {
            return;
        }

        let processedStats;

        switch (gameMode) {
            case GameMode.Duels:
                processedStats = getProcessedStats(playerStats.stats.duels, playerStats.enemyStats.duels, countries, time);
                break;
            case GameMode.DuelsRanked:
                processedStats = getProcessedStats(playerStats.stats.duelsRanked, playerStats.enemyStats.duelsRanked, countries, time);
                break;
            case GameMode.TeamDuels:
                processedStats = getProcessedStats(playerStats.stats.teamDuels, playerStats.enemyStats.teamDuels, countries, time);
                break;
            case GameMode.TeamDuelsRanked:
                processedStats = getProcessedStats(playerStats.stats.teamDuelsRanked, playerStats.enemyStats.teamDuelsRanked, countries, time);
                break;
            case GameMode.TeamFun:
                processedStats = getProcessedStats(playerStats.stats.teamFun, playerStats.enemyStats.teamFun, countries, time);
                break;
        }

        if (processedStats) {
            sortCountryStats(processedStats.stats, sortedBy, sortingDirection);

            setAverageStats(getAverageStats(processedStats.stats, processedStats.enemyStats));
            setCountryStats(processedStats.stats);
            setEnemyCountryStats(processedStats.enemyStats);
        }
    }, [countries, gameMode, playerStats, time]);

    useEffect(() => {
        setCountryStats((currentCountryStats) => {
            if (!currentCountryStats) {
                return null;
            }

            const newCountryStats = [...currentCountryStats];
            sortCountryStats(newCountryStats, sortedBy, sortingDirection);

            return newCountryStats;
        });
    }, [sortedBy, sortingDirection]);

    useEffect(() => {
        if (!countryStats || !enemyCountryStats) {
            return;
        }

        setAverageStats(getAverageStats(
            countryStats.filter((countryStats) =>
                countryStats.countryName.toLowerCase().includes(countryFilter) ||
                countryStats.continent.toLowerCase().includes(countryFilter)),
            enemyCountryStats.filter((countryStats) =>
                countryStats.countryName.toLowerCase().includes(countryFilter) ||
                countryStats.continent.toLowerCase().includes(countryFilter))
        ));
    }, [countryFilter, countryStats, enemyCountryStats]);

    return (
        <ContainerPage>
            <div className={"flex justify-center"}>
                <div className={"my-20"}>
                    <div className={"flex flex-row justify-between"}>
                        <FilterCountries countryFilter={countryFilter} setCountryFilter={setCountryFilter} placeholder={"Search for Countries, Regions, ..."}/>
                        <CustomizeData setSelectedColumns={setSelectedColumns} selectedColumns={selectedColumns} e={Key}/>
                    </div>
                    <Table className={"border-separate border-spacing-0 text-base relative"}>
                        <TableCaption>Your stats all in one place</TableCaption>
                        <TableHeader>
                            <TableRow className={"sticky top-0 hover:bg-muted-0 bg-background"}>
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
                            {countryStats && countryStats
                                .filter((countryStats) =>
                                    countryStats.countryName.toLowerCase().includes(countryFilter) ||
                                    countryStats.continent.toLowerCase().includes(countryFilter))
                                .map((countryStats) => (
                                    <TableRow
                                        key={countryStats.countryCode}
                                        onMouseOver={(event) => event.currentTarget.style.cursor = "pointer"}
                                        onMouseLeave={(event) => event.currentTarget.style.cursor = "default"}
                                        onClick={() => navigate(`/countries/${countryStats.countryCode.toLowerCase()}`)}
                                    >
                                        {selectedColumns.has(Key.Name) &&
                                            <TableCell className={"flex flex-row items-center gap-2"}>
                                                <img
                                                    className={"w-8"}
                                                    src={`/flags/countries/${countryStats.countryCode.toLowerCase()}.svg`}
                                                    alt={`${countryStats.countryName} Flag`}
                                                />
                                                {countryStats.countryName}
                                            </TableCell>
                                        }
                                        {selectedColumns.has(Key.HitRate) &&
                                            <TableCell className={"pl-6"}>{countryStats.hitRate > NO_DATA ? countryStats.hitRate + "%" : "-"}</TableCell>
                                        }
                                        {selectedColumns.has(Key.EnemyHitRate) &&
                                            <TableCell className={"pl-6"}>{countryStats.enemyHitRate > NO_DATA ? countryStats.enemyHitRate + "%" : "-"}</TableCell>
                                        }
                                        {selectedColumns.has(Key.AveragePoints) &&
                                            <TableCell className={"pl-6"}>{countryStats.averagePoints > NO_DATA ? countryStats.averagePoints : "-"}</TableCell>
                                        }
                                        {selectedColumns.has(Key.AverageEnemyPoints) &&
                                            <TableCell className={"pl-6"}>{countryStats.averageEnemyPoints > NO_DATA ? countryStats.averageEnemyPoints : "-"}</TableCell>
                                        }
                                        {selectedColumns.has(Key.AverageDamage) &&
                                            <TableCell className={"pl-6"}>{countryStats.averageDamage > NO_DATA ? countryStats.averageDamage : "-"}</TableCell>
                                        }
                                        {selectedColumns.has(Key.Count) &&
                                            <TableCell className={"text-right pr-6"}>{countryStats.count}</TableCell>
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
                                        <TableCell className={"pl-6"}>{averageStats.hitRate > NO_DATA ? averageStats.hitRate + "%" : "-"}</TableCell>
                                    }
                                    {selectedColumns.has(Key.EnemyHitRate) &&
                                        <TableCell className={"pl-6"}>{averageStats.enemyHitRate > NO_DATA ? averageStats.enemyHitRate + "%" : "-"}</TableCell>
                                    }
                                    {selectedColumns.has(Key.AveragePoints) &&
                                        <TableCell className={"pl-6"}>{averageStats.averagePoints > NO_DATA ? averageStats.averagePoints : "-"}</TableCell>
                                    }
                                    {selectedColumns.has(Key.AverageEnemyPoints) &&
                                        <TableCell className={"pl-6"}>{averageStats.averageEnemyPoints > NO_DATA ? averageStats.averageEnemyPoints : "-"}</TableCell>
                                    }
                                    {selectedColumns.has(Key.AverageDamage) &&
                                        <TableCell className={"pl-6"}>{averageStats.averageDamage > NO_DATA ? averageStats.averageDamage : "-"}</TableCell>
                                    }
                                    {selectedColumns.has(Key.Count) &&
                                        <TableCell className={"text-right pr-6"}>{averageStats.count}</TableCell>
                                    }
                                </TableRow>
                            }
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </ContainerPage>
    )
}

export default CountriesPage;