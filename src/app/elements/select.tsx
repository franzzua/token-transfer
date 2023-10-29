import {FC, ReactElement, useEffect, useState} from "react";

export type SelectProps = {
    value: string;
    children: ReactElement;
    className?: string;
}
export const Select: FC<SelectProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        setIsOpen(false);
    }, [props.value]);
    return <>
        <div flex="row" align="center"
             className={props.className}
             onClick={() => setIsOpen(x => !x)}>
            {props.value}
            <span>{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && props.children}
    </>
}