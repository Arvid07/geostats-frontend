import SignUpForm from "@/router/sign-in/components/SignUpForm.tsx";
import {useState} from "react";
import VerifyEmailForm from "@/router/sign-in/components/VerifyEmailForm.tsx";
import {useNavigate} from "react-router-dom";

export interface SignUpData {
    email: string;
    password: string;
}

export interface VerifyEmailData {
    email: string;
    verificationCode: string;
}

interface UserVerifyEmailResponse {
    verification_code_expire: string;
}

function SignUpPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [codeExpireDate, setCodeExpireDate] = useState<Date | null>(null);
    const [inVerifyProcess, setInVerifyProcess] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    function sendSignUpRequest(signUpData: SignUpData) {
        if (submitButtonDisabled) {
            return;
        }

        setSubmitButtonDisabled(true);
        setEmail(signUpData.email);

        fetch("http://localhost:8080/signup", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(signUpData)
        }).then(async (response) => {
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            return await response.json() as UserVerifyEmailResponse;
        }).then((responseObject) => {
            setCodeExpireDate(new Date(responseObject.verification_code_expire));
            setInVerifyProcess(true);
        }).catch((err: Error) => {
            setErrorMessage(err.message);
        }).finally(() => {
            setSubmitButtonDisabled(false);
        });
    }

    function sendVerifyEmailRequest(code: string) {
        if (!email || submitButtonDisabled) {
            return;
        }

        setSubmitButtonDisabled(true);

        const verifyEmailData: VerifyEmailData = {
            email: email,
            verificationCode: code
        };

        fetch("http://localhost:8080/verify-email", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(verifyEmailData)
        }).then(async (response) => {
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText);
            }

            navigate("/");
        }).catch((err) => {
            setErrorMessage(err.message);
        }).finally(() => {
            setSubmitButtonDisabled(false);
        });
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <SignUpForm
                    inVerifyProcess={inVerifyProcess}
                    sendSignUpRequest={sendSignUpRequest}
                    submitButtonDisabled={submitButtonDisabled}
                    errorMessage={errorMessage}
                />
                <VerifyEmailForm
                    inVerifyProcess={inVerifyProcess}
                    setInVerifyProcess={setInVerifyProcess}
                    codeExpireDate={codeExpireDate}
                    sendVerifyEmailRequest={sendVerifyEmailRequest}
                    email={email}
                    submitButtonDisabled={submitButtonDisabled}
                    errorMessage={errorMessage}
                />
            </div>
        </div>
    );
}

export default SignUpPage;