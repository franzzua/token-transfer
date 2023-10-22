import {Layout} from "../components/layout";
import {Main} from "../pages/main";
import {container} from "./container";
import {DiContainer, DiContext} from "./di-context";

export const App = () => {
    const diContainer = container.get<DiContainer>(DiContainer);
    return (
        <DiContext.Provider value={diContainer}>
            <Layout>
                <Main/>
            </Layout>
        </DiContext.Provider>
    );
}