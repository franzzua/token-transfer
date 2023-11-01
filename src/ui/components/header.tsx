import {AccountSelect} from "./account-select";
import style from "./header.module.less";

export const Header = () => {
    return <div className={style.header}>
        <AccountSelect/>
        {/*<span className="frost-card">*/}
        {/*    0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC*/}
        {/*</span>*/}
    </div>;
}