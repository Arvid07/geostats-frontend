import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import * as React from "react";
import type { JSX } from "react";

interface Props {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleEditAccountLink: (event: React.FormEvent<HTMLFormElement>) => void;
    playerId: string | undefined;
    buttonDisabled: boolean;
    showErrorMessage: () => JSX.Element | null;
}

function EditPlayerId({ isDialogOpen, setIsDialogOpen, handleEditAccountLink, playerId, buttonDisabled, showErrorMessage }: Props){

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit player id</DialogTitle>
                    <DialogDescription>
                        Go to your geo guessr{" "}
                        <a
                            href={"https://www.geoguessr.com/me/profile"}
                            className={"underline"}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                        >
                            profile
                        </a>
                        {" "}and scroll all the way down. Then copy the player id and paste it into the form.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditAccountLink}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="playerId" className="text-right">
                                Player Id
                            </Label>
                            <Input
                                id="playerId"
                                name="playerId"
                                placeholder={"e.g. 59b3c74a17631e74145ea149"}
                                defaultValue={playerId}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={buttonDisabled}>Save changes</Button>
                    </DialogFooter>
                    {showErrorMessage()}
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditPlayerId;