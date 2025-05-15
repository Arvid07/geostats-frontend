import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import type {LoginData} from "@/router/sign-in/LoginPage.tsx";
import * as React from "react";

interface Props {
    sendLoginRequest: (loginData: LoginData) => void;
    errorMessage: string | null;
    submitButtonDisabled: boolean;
}

function LoginForm({ sendLoginRequest, errorMessage, submitButtonDisabled }: Props) {
    function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const data = new FormData(form);
        const email = data.get("email") as string;
        const password = data.get("password") as string;

        const loginData: LoginData = {
            email: email,
            password: password
        };

        sendLoginRequest(loginData);
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
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
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
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name={"password"}
                                    type="password"
                                    required
                                />
                            </div>
                            <Button disabled={submitButtonDisabled} type="submit" className="w-full">
                                Login
                            </Button>
                            <Button disabled={submitButtonDisabled} variant="outline" className="w-full">
                                Login with Google
                            </Button>
                            {showErrorMessage()}
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don't have an account?{" "}
                            <a href="http://localhost:5173/signup" className="underline underline-offset-4">
                                Sign up
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginForm;
