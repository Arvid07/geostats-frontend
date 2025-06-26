import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {XIcon} from "lucide-react";
import * as React from "react";

interface Props {
    countryFilter: string;
    setCountryFilter: React.Dispatch<React.SetStateAction<string>>;
    placeholder: string;
}

function FilterCountries({countryFilter, setCountryFilter, placeholder}: Props) {
    return (
        <div className={"relative flex flex-row items-center w-7/10 mb-4"}>
            <Input
                placeholder={placeholder}
                value={countryFilter}
                onInput={(event) => setCountryFilter(event.currentTarget.value)}
            />
            <Button
                className={
                    "h-6 w-6 z-10 absolute right-2 ring-offset-background focus:ring-ring data-[state=open]:bg-accent " +
                    "data-[state=open]:text-muted-foreground rounded-xs opacity-70 transition-opacity hover:opacity-100 " +
                    "focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none " +
                    "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                }
                variant={"ghost"}
                onClick={(event) => {
                    setCountryFilter("");
                    event.currentTarget.blur();
                }}
            >
                <XIcon/>
            </Button>
        </div>
    );
}

export default FilterCountries;