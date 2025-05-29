import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table.tsx";
import ContainerPage from "@/router/ContainerPage.tsx";
import {useContext, useEffect, useState} from "react";
import {Context} from "@/App.tsx";
import {type CountryAdvancedStats, type StatsGuess, TeamGameMode} from "@/Components.ts";
import {makePlayerStatsRequest} from "@/router/utils.ts";

const AVERAGE_STATS_ID = "ALL";

interface IndividualCountryStats {
    points: number;
    hitCount: number;
    count: number;
}

function getIndividualCountryStats(rawData: StatsGuess[]) {
    const stats = new Map<string, IndividualCountryStats>();

    const statsAverage: IndividualCountryStats = {
        points: 0,
        hitCount: 0,
        count: 0
    };

    stats.set(AVERAGE_STATS_ID, statsAverage);

    for (const guess of rawData) {
        const countryStats = stats.get(guess.roundCountryCode);
        const averageStats = stats.get(AVERAGE_STATS_ID)!;

        const updatedStatsAverage: IndividualCountryStats = {
            points: averageStats.points + guess.points,
            hitCount: averageStats.hitCount + Number(guess.guessCountryCode === guess.roundCountryCode),
            count: averageStats.count + 1
        };

        stats.set(AVERAGE_STATS_ID, updatedStatsAverage);

        if (countryStats) {
            const newStats: IndividualCountryStats = {
                points: countryStats.points + guess.points,
                hitCount: countryStats.hitCount + Number(guess.guessCountryCode === guess.roundCountryCode),
                count: countryStats.count + 1
            };

            stats.set(guess.roundCountryCode, newStats);
        } else {
            const startStats: IndividualCountryStats = {
                points: guess.points,
                hitCount: Number(guess.guessCountryCode === guess.roundCountryCode),
                count: 1
            };

            stats.set(guess.roundCountryCode, startStats);
        }
    }

    return stats;
}

function getProcessedStats(
    rawStats: StatsGuess[],
    rawEnemyStats: StatsGuess[],
    countryIds: string[]
) {
    const stats: CountryAdvancedStats[] = [];

    const playerIndividualStats = getIndividualCountryStats(rawStats);
    const enemyIndividualStats = getIndividualCountryStats(rawEnemyStats);

    const averageStats = playerIndividualStats.get(AVERAGE_STATS_ID);
    const enemyAverageStats = enemyIndividualStats.get(AVERAGE_STATS_ID);

    if (averageStats && enemyAverageStats) {
        const averageAdvancedStats: CountryAdvancedStats = {
            countryCode: AVERAGE_STATS_ID,
            hitRate: (Math.round(1000 * averageStats.hitCount / averageStats.count) / 10) + "%",
            averagePoints: Math.round(averageStats.points / averageStats.count).toString(),
            relativePoints: (Math.round(averageStats.points / averageStats.count) - Math.round(enemyAverageStats.points / enemyAverageStats.count)).toString(),
            count: averageStats.count
        }

        stats.push(averageAdvancedStats);
    } else {
        const averageAdvancedStats: CountryAdvancedStats = {
            countryCode: AVERAGE_STATS_ID,
            averagePoints: "-",
            hitRate: "-",
            relativePoints: "-",
            count: 0
        }

        stats.push(averageAdvancedStats);
    }

    for (const countryId of countryIds) {
        const playerCountryStats = playerIndividualStats.get(countryId);
        const enemyCountryStats = enemyIndividualStats.get(countryId);

        if (playerCountryStats?.count || 0 > 0) {
            const countryAdvancedStats: CountryAdvancedStats = {
                countryCode: countryId,
                averagePoints: Math.round((playerCountryStats?.points || 0) / (playerCountryStats?.count || 1)).toString(),
                hitRate: Math.round((playerCountryStats?.hitCount || 0) / (playerCountryStats?.count || 1) * 1000) / 10 + "%",
                relativePoints: Math.round((playerCountryStats?.points || 0) / (playerCountryStats?.count || 1) - (enemyCountryStats?.points || 0) / (enemyCountryStats?.count || 1)).toString(),
                count: playerCountryStats?.count || 0
            }
            stats.push(countryAdvancedStats);
        } else {
            const countryAdvancedStats: CountryAdvancedStats = {
                countryCode: countryId,
                averagePoints: "-",
                hitRate: "-",
                relativePoints: "-",
                count: 0
            }
            stats.push(countryAdvancedStats);
        }
    }

    return stats;
}

function CountriesPage() {
    const [countryStats, setCountryStats] = useState<CountryAdvancedStats[] | null>(null);
    const countryNames = new Intl.DisplayNames(["en"], {type: "region"})

    const {
        playerStats,
        gameMode,
        countryIds,
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

        switch (gameMode) {
            case TeamGameMode.Duels:
                setCountryStats(getProcessedStats(playerStats.stats.duels, playerStats.enemyStats.duels, countryIds));
                break;
            case TeamGameMode.DuelsRanked:
                setCountryStats(getProcessedStats(playerStats.stats.duelsRanked, playerStats.enemyStats.duelsRanked, countryIds));
                break;
            case TeamGameMode.TeamDuels:
                setCountryStats(getProcessedStats(playerStats.stats.teamDuels, playerStats.enemyStats.teamDuels, countryIds));
                break;
            case TeamGameMode.TeamDuelsRanked:
                setCountryStats(getProcessedStats(playerStats.stats.teamDuelsRanked, playerStats.enemyStats.teamDuelsRanked, countryIds));
                break;
            case TeamGameMode.TeamFun:
                setCountryStats(getProcessedStats(playerStats.stats.teamFun, playerStats.enemyStats.teamFun, countryIds));
                break;
            case TeamGameMode.Ranked:
                setCountryStats(getProcessedStats(playerStats.stats.duelsRanked, playerStats.enemyStats.duelsRanked, countryIds));
                break;
        }
    }, [countryIds, gameMode, playerStats]);

    function getFooter() {
        let hitRate = "-";
        let averagePoints = "-";
        let relativePoints = "-";
        let count = 0;
        
        if (countryStats && countryStats.length > 0) {
            hitRate = countryStats[0].hitRate;
            averagePoints = countryStats[0].averagePoints;
            relativePoints = countryStats[0].relativePoints;
            count = countryStats[0].count;
        }

        return (
            <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>{hitRate}</TableCell>
                <TableCell>{averagePoints}</TableCell>
                <TableCell>{relativePoints}</TableCell>
                <TableCell className={"text-right"}>{count}</TableCell>
            </TableRow>
        );
    }

    return (
        <ContainerPage>
            <div className={"flex justify-center"}>
                <div className={"rounded-2xl border-solid border-white my-20"}>
                    <Table className={"text-base"}>
                        <TableCaption>Your stats all in one place</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className={"w-60"}>Country</TableHead>
                                <TableHead className={"w-50"}>Hit Rate</TableHead>
                                <TableHead className={"w-50"}>Avg. Points</TableHead>
                                <TableHead className={"w-50"}>Avg. Damage</TableHead>
                                <TableHead className={"w-25 text-right"}>Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {countryStats && countryStats
                                .filter((countryStats) => countryStats.countryCode !== AVERAGE_STATS_ID)
                                .map((countryStats) => (
                                    <TableRow key={countryStats.countryCode}>
                                        <TableCell className={"flex flex-row items-center gap-2"}>
                                            <img
                                                className={"w-8"}
                                                src={`https://flagsapi.com/${countryStats.countryCode}/flat/64.png`}
                                                alt={`${countryNames.of(countryStats.countryCode)!} Flag`}
                                            />
                                            {countryNames.of(countryStats.countryCode)!}
                                        </TableCell>
                                        <TableCell>{countryStats.hitRate}</TableCell>
                                        <TableCell>{countryStats.averagePoints}</TableCell>
                                        <TableCell>{countryStats.relativePoints}</TableCell>
                                        <TableCell className={"text-right"}>{countryStats.count}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                        <TableFooter>
                            {getFooter()}
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </ContainerPage>
    )
}

export default CountriesPage;