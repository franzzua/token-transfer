import {FunctionComponent, JSX} from "preact";
import {useState} from "preact/hooks";

export type LabelProps = {
    children: any;
    error?: string | undefined;
    title?: JSX.Element | string;
}
export const Label: FunctionComponent<LabelProps> = (props) => {
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