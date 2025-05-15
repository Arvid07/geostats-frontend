import LoginForm from "./components/LoginForm.tsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export interface LoginData {
    email: string;
    password: string;
}

function LoginPage() {
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    function sendLoginRequest(loginData: LoginData) {
        if (submitButtonDisabled) {
            return;
        }

        setSubmitButtonDisabled(true);

        fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(loginData)
        }).then(async (response) => {
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            navigate("/");
        }).catch((err: Error) => {
            setErrorMessage(err.message);
        }).finally(() => {
            setSubmitButtonDisabled(false);
        });
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm sendLoginRequest={sendLoginRequest} errorMessage={errorMessage} submitButtonDisabled={submitButtonDisabled}/>
            </div>
        </div>
    );
}

export default LoginPage;