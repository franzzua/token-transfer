import {ConfigProvider} from "antd";
import {Layout} from "./layout";
import {container} from "../container";
import {DiContainer, AppContext} from "./contexts/app-context";
import {useRouter} from "./routing";
import {theme} from "./theme";

export const App = () => {
    const diContainer = container.get<DiContainer>(DiContainer);
    const route = useRouter();
    return (
        <ConfigProvider theme={theme} card={{
            style: {
                background: '#FFF6',
                backdropFilter: 'blur(3px)'
            }
        }}>
            <AppContext.Provider value={diContainer}>
                <Layout>
                    <route.active.page />
                </Layout>
            </AppContext.Provider>
        </ConfigProvider>
    );
}