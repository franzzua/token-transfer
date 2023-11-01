import {useEffect, useRef} from "preact/hooks";
import {TtmLinkStore} from "../../stores/interfaces";
import {useCell} from "../helpers/use-cell";
import {toCanvas} from 'qrcode/lib/index.js'
import {FunctionComponent} from "preact";

export const TtmLink: FunctionComponent<{store: TtmLinkStore}> = ({store}) => {
    const url = useCell(() => store.URL);
    const ref = useRef<HTMLCanvasElement>();
    useEffect(() => {
        if (!ref.current || !url) return;
        toCanvas(ref.current, url, {
            color: {
                dark: getComputedStyle(document.body).getPropertyValue('--dark'),
                light: getComputedStyle(document.body).getPropertyValue('--light-green'),
            }
        });
    }, [ref, url])
    return <div flex="column" align="center" gap="2">
        <a style={{
            maxWidth: '80%',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        }} href={url} target="_blank" rel="noreferrer">{url}</a>
        <canvas ref={ref}/>
    </div>
}
