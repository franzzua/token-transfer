import {useEffect, useRef} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {toCanvas} from 'qrcode/lib/index.js'
import {useTransferStore} from "../contexts/useTransferStore";

export const TtmLink = () => {
    const transferStore = useTransferStore<TransferToMeStore>();
    const url = useCell(() => transferStore.URL);
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