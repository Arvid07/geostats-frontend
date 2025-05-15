import {ThemeProvider} from "@/components/ThemeProvider.tsx";
import ContainerPage from "@/router/ContainerPage.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import LoginPage from "@/router/sign-in/LoginPage.tsx";
import SignUpPage from "@/router/sign-in/SignUpPage.tsx";

function App() {
    return (
        <div className={"font-geist"}>
            <ThemeProvider defaultTheme={"dark"} storageKey={"vite-ui-theme"}>
                <BrowserRouter>
                    <Routes>
                        <Route path={"/"} element={<ContainerPage/>}/>
                        <Route path={"/login"} element={<LoginPage/>}/>
                        <Route path={"/signup"} element={<SignUpPage/>}/>
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    )
}

export default App