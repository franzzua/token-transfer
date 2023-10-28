import {theme as baseTheme} from "antd";
import type {ConfigProviderProps} from "antd/es/config-provider";

export const theme: ConfigProviderProps = {
    theme: {
        algorithm: baseTheme.defaultAlgorithm,
        token: {},
        components: {
            Card: {},
            Button:{
                colorBgContainer: 'var(--light-blue)',
                // colorPrimaryBg: 'var(--dark-blue)',
                // colorBgBase: 'var(--dark-blue)',
                colorErrorBg: 'var(--red)',
                colorBorder: 'transparent'
            },
            Input: {
                addonBg: 'var(--light-blue)',
                colorBgContainer: 'var(--light-green)',
                colorBorder: 'transparent'
            }
        }
    },
    button: {
        style: {
        }
    },
    input: {
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