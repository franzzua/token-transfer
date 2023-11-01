import {FunctionComponent, JSX} from "preact";
import {useEffect, useState} from "preact/hooks";

export type SelectProps = {
    value: string;
    children: JSX.Element | JSX.Element[];
    className?: string;
}
export const Select: FunctionComponent<SelectProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        setIsOpen(false);
    }, [props.value]);
    useEffect(() => {
        const escListener = (e: KeyboardEvent) => {
            if (e.key != 'Escape') return;
            setIsOpen(false);
        };
        document.addEventListener('keyup', escListener);
        return () => document.removeEventListener('keyup', escListener);
    }, []);
    return <>
        <div flex="row" align="center" gap="1"
             className={props.className}
             onClick={() => setIsOpen(x => !x)}>
            {props.value}
            <span>{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && props.children}
    </>
}