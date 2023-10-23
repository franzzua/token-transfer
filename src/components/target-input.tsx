import {Input, InputProps} from "antd";
import {FunctionComponent} from "react";

export type TargetInputProps = {
    target: string;
    onChange(target: string): void;
} & Omit<InputProps, "value"|"onChange">
export const TargetInput: FunctionComponent<TargetInputProps> = ({target,onChange,...props}) => {
    return <Input {...props}
                  value={target}
                  onChange={e => onChange(e.currentTarget.value)}/>
}