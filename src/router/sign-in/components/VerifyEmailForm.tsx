import { Button } from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import * as React from "react";
import {Separator} from "@/components/ui/separator.tsx";
import {useState} from "react";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/components/ui/input-otp.tsx";

interface Props {
    codeExpireDate: Date | null;
    inVerifyProcess: boolean;
    setInVerifyProcess: React.Dispatch<React.SetStateAction<boolean>>;
    email: string | null;
    sendVerifyEmailRequest: (code: string) => void;
    submitButtonDisabled: boolean;
    errorMessage: string | null;
}

function VerifyEmailForm({ codeExpireDate, inVerifyProcess, setInVerifyProcess, sendVerifyEmailRequest, email, submitButtonDisabled, errorMessage }: Props) {
    const [code, setCode] = useState<string | null>(null);

    if (!inVerifyProcess || !email) {
        return null;
    }

    function handleVerifyEmail(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (code) {
            sendVerifyEmailRequest(code);
        }
    }

    function showErrorMessage() {
        if (!errorMessage) {
            return null;
        }

        return (
            <p className={"text-red-600 italic"}>{errorMessage}</p>
        );
    }

    return (
        <div>
            <Card>
                <CardHeader className={"flex flex-col items-center justify-center"}>
                    <CardTitle className="text-2xl">Verify your email</CardTitle>
                    <CardDescription>
                        <Separator className={"my-3"}/>
                        <div className={"flex flex-col items-center justify-center mb-5"}>
                            <p>A verification code has been sent to</p>
                            <span className={"font-bold"}>{email}</span>
                        </div>
                        <p>Please check your inbox and enter the verification code below to verify your email address.
                            {codeExpireDate && ` The code will expire at ${codeExpireDate.toLocaleTimeString()}`}
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerifyEmail}>
                        <div className="flex flex-col items-center justify-center gap-6">
                            <InputOTP
                                maxLength={6}
                                required
                                onChange={setCode}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0}/>
                                    <InputOTPSlot index={1}/>
                                    <InputOTPSlot index={2}/>
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3}/>
                                    <InputOTPSlot index={4}/>
                                    <InputOTPSlot index={5}/>
                                </InputOTPGroup>
                            </InputOTP>
                            <Button className={"w-full"}>Verify</Button>
                        </div>
                    </form>
                    <div className="flex justify-evenly mt-4 text-center text-sm">
                        <Button disabled={submitButtonDisabled} variant={"link"} onClick={() => setInVerifyProcess(false)}>
                            Change email
                        </Button>
                        <Button disabled={submitButtonDisabled} variant={"link"}>
                            Resend code
                        </Button>
                    </div>
                    {showErrorMessage()}
                </CardContent>
            </Card>
        </div>
    )
}

export default VerifyEmailForm;
