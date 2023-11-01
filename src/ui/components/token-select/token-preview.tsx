import {FunctionComponent} from "preact";
import {useAppContext} from "../../contexts";
import {useAsync} from "../../helpers/use-async";
import style from "./token-select.module.less";

export const TokenPreview: FunctionComponent<{
    token: TokenInfo;
    isSelected: boolean;
    onChange(token: TokenInfo): void;
}> = ({token, onChange, isSelected}) => {
    if (isSelected) console.log(token, 'selected')
    const {tokensStore} = useAppContext();
    const logoURI = useAsync(() => tokensStore.getTokenImageURL(token.address), [token.address]);
    return <div className={[
        isSelected ? style.tokenPreviewSelected : style.tokenPreview
    ]} onClick={() => onChange(token)}>
        {
            logoURI.data
                ? <img alt={token.name} src={logoURI.data} className={style.img}/>
                : <div className={style.img}>{token.name}</div>
        }
        <span>{token.symbol}</span>
    </div>;
};