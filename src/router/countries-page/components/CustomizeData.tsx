import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CheckIcon, ChevronDownIcon} from "lucide-react";
import * as React from "react";
import {useContext} from "react";
import {Context} from "@/App.tsx";
import {GameMode, GeoMode, Time} from "@/Components.ts";
import type {MapInfo} from "@/router/country-page/utils.ts";
import {DataView} from "@/router/country-page/components/DataTable.tsx";

interface Props<E extends { [k: string]: string }> {
    e: E;
    selectedColumns: Set<E[keyof E]>;
    setSelectedColumns: React.Dispatch<React.SetStateAction<Set<E[keyof E]>>>;
    dataView?: Set<DataView>;
    setDataView?: React.Dispatch<React.SetStateAction<Set<DataView>>>;
    includeSolo?: boolean;
    soloColumns?: Set<E[keyof E]>;
    maps?: Map<GameMode, Map<string, MapInfo>> | null;
    setMaps?: React.Dispatch<React.SetStateAction<Map<GameMode, Map<string, MapInfo>> | null>>;
    geoMode?: GeoMode;
    setGeoMode?: React.Dispatch<React.SetStateAction<GeoMode>>;
}

function CustomizeData<E extends { [k: string]: string }>(
    {
        e,
        selectedColumns,
        setSelectedColumns,
        dataView,
        setDataView,
        includeSolo=false,
        soloColumns,
        maps,
        setMaps,
        geoMode,
        setGeoMode
    }: Props<E>
) {
    const enumValues = Object.values(e) as E[keyof E][];

    const {
        gameMode,
        setGameMode,
        time,
        setTime
    } = useContext(Context);

    function handleColumnChange(event: React.MouseEvent<HTMLDivElement, MouseEvent>, key: E[keyof E]) {
        event.preventDefault();

        setSelectedColumns((columns) => {
            const newColumns = new Set(columns);

            if (newColumns.has(key)) {
                newColumns.delete(key);
            } else {
                newColumns.add(key)
            }
            return newColumns;
        });
    }

    function handleDataViewChange(event: React.MouseEvent<HTMLDivElement, MouseEvent>, dataView: DataView) {
        event.preventDefault();

        setDataView!((view) => {
            const newDataView = new Set(view);

            if (newDataView.has(dataView)) {
                newDataView.delete(dataView);
            } else {
                newDataView.add(dataView)
            }

            return newDataView;
        });
    }

    function handleMapSelectChange(event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string, mapInfo: MapInfo) {
        event.preventDefault();

        setMaps!((maps) => {
            const newMaps = new Map(maps);

            newMaps.get(gameMode)!.set(id, {
                name: mapInfo.name,
                selected: !mapInfo.selected,
                count:  mapInfo.count
            });

            return newMaps;
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Customize <ChevronDownIcon/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Game Mode</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {includeSolo && <DropdownMenuItem onClick={() => setGameMode(GameMode.Solo)}>
                                Solo {gameMode === GameMode.Solo && <CheckIcon/>}
                            </DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => setGameMode(GameMode.DuelsRanked)}>
                                Competitive Duels {gameMode === GameMode.DuelsRanked && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGameMode(GameMode.Duels)}>
                                Duels {gameMode === GameMode.Duels && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGameMode(GameMode.TeamDuelsRanked)}>
                                Competitive Team Duels {gameMode === GameMode.TeamDuelsRanked && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setGameMode(GameMode.TeamDuels)}>
                                Team Duels {gameMode === GameMode.TeamDuels && <CheckIcon/>}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                {setGeoMode &&
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Geo Mode</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setGeoMode(GeoMode.Moving)}>
                                    Moving {geoMode === GeoMode.Moving && <CheckIcon/>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setGeoMode(GeoMode.NoMove)}>
                                    NoMove {geoMode === GeoMode.NoMove && <CheckIcon/>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setGeoMode(GeoMode.NMPZ)}>
                                    NMPZ {geoMode === GeoMode.NMPZ && <CheckIcon/>}
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                }
                <DropdownMenuSub>
                    {dataView && <><DropdownMenuSubTrigger>View</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {Object.values(DataView).map(view => (
                                    <DropdownMenuItem
                                        className={"flex flex-row"}
                                        onClick={(event) => handleDataViewChange(event, view)}
                                    >
                                        {view} {dataView.has(view) && <CheckIcon/>}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal></>
                    }
                </DropdownMenuSub>
                <DropdownMenuSub>
                    {maps && <><DropdownMenuSubTrigger>Maps</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {Array.from(maps.get(gameMode)!).map(([id, mapInfo]) => (
                                    <DropdownMenuItem
                                        className={"flex flex-row"}
                                        onClick={(event) => handleMapSelectChange(event, id, mapInfo)}
                                    >
                                        {`${mapInfo.name} (${mapInfo.count})`} {mapInfo.selected && <CheckIcon/>}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal></>
                    }
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Columns</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {enumValues.filter((key) => gameMode !== GameMode.Solo || soloColumns?.has(key)).map((key) => (
                                <DropdownMenuItem
                                    className={"flex flex-row"}
                                    onClick={(event) => handleColumnChange(event, key)}
                                >
                                    {key} {selectedColumns.has(key) && <CheckIcon/>}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Time</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTime(Time.AllTime)}>
                                All Time {time === Time.AllTime && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTime(Time.ThisWeek)}>
                                This Weak {time === Time.ThisWeek && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTime(Time.Last7Days)}>
                                Last 7 days {time === Time.Last7Days && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTime(Time.Last30Days)}>
                                Last 30 days {time === Time.Last30Days&& <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTime(Time.LastYear)}>
                                Last Year {time === Time.LastYear && <CheckIcon/>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTime(Time.Custom)}>
                                Custom {time === Time.Custom && <CheckIcon/>}
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default CustomizeData;