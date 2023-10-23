import {Layout} from "./layout";
import {container} from "./container";
import {DiContainer, AppContext} from "../contexts/app-context";
import {useRouter} from "./routing";

export const App = () => {
    const diContainer = container.get<DiContainer>(DiContainer);
    const route = useRouter();
    const Page = route.active.page;
    console.log(route);
    return (
        <AppContext.Provider value={diContainer}>
            <Layout>
                <Page/>
            </Layout>
        </AppContext.Provider>
    );
}