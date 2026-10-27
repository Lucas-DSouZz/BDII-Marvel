import { NavLink } from "react-router-dom";
import type { ButtonHTMLAttributes } from "react";
import type { Icon } from "@phosphor-icons/react";

import "./Buttons.css";

interface NLButtonProps {
    IconLeft?: Icon;
    IconRight?: Icon;
    Text: string;
    Theme: string;
    To: string;
}

export function NLButton({
    IconLeft,
    IconRight,
    Text,
    Theme,
    To
} : NLButtonProps) {
    return (
        <NavLink to={To}>
            <div className={`custom-button ${Theme}`}>
                {IconLeft && (
                    <IconLeft
                        size={16}
                        weight="bold"
                    />
                )}
                
                <span>{Text}</span>
                
                {IconRight && (
                    <IconRight
                        size={16}
                        weight="bold"
                    />
                )}
            </div>
        </NavLink>
    );
}


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    IconLeft?: Icon;
    IconRight?: Icon;
    Text: string;
    Theme: string;
}

export function CustomButton({
    IconLeft,
    IconRight,
    Text,
    Theme,
    ...props
} : ButtonProps) {
    return (
        <button className={`custom-button ${Theme}`}
            type="button"
            {...props}
        >
            {IconLeft && (
                    <IconLeft
                        size={16}
                        weight="bold"
                    />
                )}
                
                <span>{Text}</span>
                
                {IconRight && (
                    <IconRight
                        size={16}
                        weight="bold"
                    />
                )}
        </button>
    );
}