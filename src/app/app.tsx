import {ConfigProvider} from "antd";
import {AppStore} from "../stores/app-store";
import {Layout} from "./pages/layout";
import {container} from "../container";
import {AppContext} from "./contexts/app-context";
import {useRouter} from "./routing";
import {theme} from "./theme";

export const App = () => {
    const diContainer = container.get<AppStore>(AppStore);
    const route = useRouter();
    return (
        <ConfigProvider {...theme}>
            <AppContext.Provider value={diContainer}>
                <Layout>
                    <route.active.page />
                </Layout>
            </AppContext.Provider>
        </ConfigProvider>
    );
}