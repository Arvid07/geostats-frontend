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
import {GameMode, Time} from "@/Components.ts";

interface Props<E extends { [k: string]: string }> {
    e: E;
    selectedColumns: Set<E[keyof E]>;
    setSelectedColumns: React.Dispatch<React.SetStateAction<Set<E[keyof E]>>>;
    dataView?: Set<DataView>;
    setDataView?: React.Dispatch<React.SetStateAction<Set<DataView>>>;
    includeSolo?: boolean;
}

export enum DataView {
    Region = "Region",
    Guess = "Guess"
}

function CustomizeData<E extends { [k: string]: string }>(
    {
        e,
        selectedColumns,
        setSelectedColumns,
        dataView,
        setDataView,
        includeSolo=false,
    }: Props<E>) {
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>Customize <ChevronDownIcon/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuSub>
                    {dataView && <><DropdownMenuSubTrigger>View</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {Object.values(DataView).map(view => (
                                    <DropdownMenuItem
                                        className={"flex flex-row justify-between"}
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
                    <DropdownMenuSubTrigger>Columns</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {enumValues.map((key) => (
                                <DropdownMenuItem
                                    className={"flex flex-row justify-between"}
                                    onClick={(event) => handleColumnChange(event, key)}
                                >
                                    {key} {selectedColumns.has(key) && <CheckIcon/>}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
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