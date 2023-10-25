import {QRCode} from "antd";
import {useContext, useEffect, useRef} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {toCanvas} from 'qrcode/lib/index.js'

export const TtmLink = () => {
    const transferStore = useContext(TransferContext) as TransferToMeStore;
    const url = useCell(() => transferStore.URL);
    const info = useCell(() => transferStore.TokenInfo);
    const ref = useRef<HTMLCanvasElement>();
    useEffect(() => {
        if (!ref.current || !url) return;
        toCanvas(ref.current, url);
    }, [ref, url])
    return <div>
        <QRCode value={url} size={300} color="blue" icon={info?.logoURI}/>
    </div>
}