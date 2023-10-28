import {theme as baseTheme} from "antd";
import type {ConfigProviderProps} from "antd/es/config-provider";

export const theme: ConfigProviderProps = {
    theme: {
        algorithm: baseTheme.defaultAlgorithm,
        token: {},
        components: {
            Card: {},
            Button:{
                colorPrimaryBg: '#354667',
                colorBgBase: 'var(--dark-blue)',
            }
        }
    },
    button: {
        style: {
        }
    },
    card: {
        style: {
            background: '#FFF6',
            backdropFilter: 'blur(3px)',
            borderWidth: 0,
            boxShadow: '#465d8f 0 0 6px 6px'
        }
    }
}