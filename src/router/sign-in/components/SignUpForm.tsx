import { Button } from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import * as React from "react";
import type {SignUpData} from "../SignUpPage.tsx";

interface Props {
    inVerifyProcess: boolean;
    sendSignUpRequest: (signUpData: SignUpData) => void;
    submitButtonDisabled: boolean;
    errorMessage: string | null;
}

function SignUpForm({ inVerifyProcess, sendSignUpRequest, submitButtonDisabled, errorMessage }: Props) {
    if (inVerifyProcess) {
        return null;
    }

    function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        const signUpData: SignUpData = {
            email: email,
            password: password
        };

        sendSignUpRequest(signUpData);
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
                <CardHeader>
                    <CardTitle className="text-2xl">Sign up</CardTitle>
                    <CardDescription>
                        Enter your email and set a password to create your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </div>
                            <Button disabled={submitButtonDisabled} type="submit" className="w-full">
                                Sign up
                            </Button>
                            <Button disabled={submitButtonDisabled} variant="outline" className="w-full">
                                Sign up with Google
                            </Button>
                            {showErrorMessage()}
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <a href="http://localhost:5173/login" className="underline underline-offset-4">
                                Login
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignUpForm;
