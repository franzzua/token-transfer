import {FC, ReactNode, useState} from "react";

export type LabelProps = {
    children: any;
    error?: string | undefined;
    title?: ReactNode;
}
export const Label: FC<LabelProps> = (props) => {
    const [isVisited, setIsVisited] = useState(false);
    return <label className={[
        !!props.error ? 'error' : '',
        isVisited ? 'visited' : ''
    ].filter(x => x).join(' ')} onBlur={() => setIsVisited(true)}>
        <span>{props.title}</span>
        {props.children}
        <span className="error-text">{props.error}</span>
    </label>
}