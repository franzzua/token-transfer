import {QRCode} from "antd";
import {useEffect, useRef} from "react";
import {useCell} from "../../helpers/use-cell";
import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {toCanvas} from 'qrcode/lib/index.js'
import {useTransferStore} from "../contexts/useTransferStore";

export const TtmLink = () => {
    const transferStore = useTransferStore<TransferToMeStore>();
    const url = useCell(() => transferStore.URL);
    const info = useCell(transferStore.TokenInfo);
    const ref = useRef<HTMLCanvasElement>();
    useEffect(() => {
        if (!ref.current || !url) return;
        toCanvas(ref.current, url);
    }, [ref, url])
    return <div>
        <QRCode value={url} size={300} color="blue" icon={info?.logoURI}/>
    </div>
}