import {FC, useState} from "react";

export type LabelProps = {
    children: any;
    error?: string | undefined;
    title?: string;
}
export const Label: FC<LabelProps> = (props) => {
    const [isVisited, setIsVisited] = useState(false);
    return <label className={[
        !!props.error ? 'error' : '',
        isVisited ? 'visited' : ''
    ].filter(x => x).join(' ')} onBlur={() => setIsVisited(true)}>
        <span>{props.title}</span>
        {props.children}
    </label>
}