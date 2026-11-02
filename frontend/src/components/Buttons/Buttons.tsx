import { NavLink, useNavigate } from "react-router-dom";
import type { ButtonHTMLAttributes } from "react";
import type { Icon } from "@phosphor-icons/react";

import "./Buttons.css";

interface NLButtonProps {
    IconLeft?: Icon;
    IconRight?: Icon;
    Text?: string;
    Theme: string;
    To?: string;
    Back?: boolean;
}

export function NLButton({
    IconLeft,
    IconRight,
    Text,
    Theme,
    To,
    Back = false
} : NLButtonProps) {
    const navigate = useNavigate();

    const content = (
        <div className={`custom-button ${Theme}`}>
            {IconLeft && (
                <IconLeft
                    size={16}
                    weight="bold"
                />
            )}
            
            {Text 
                ? <span>{Text}</span> 
                : ""
            }
            
            {IconRight && (
                <IconRight
                    size={16}
                    weight="bold"
                />
            )}
        </div>
    );

    if (Back) {
        return (
            <a 
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(-1);
                }}
            >
                {content}
            </a>
        )
    }

    return (
        <NavLink to={To ?? "/"}>
            {content}
        </NavLink>
    );
}


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    IconLeft?: Icon;
    IconRight?: Icon;
    Text?: string;
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
                
                {Text 
                    ? <span>{Text}</span> 
                    : ""
                }
                
                {IconRight && (
                    <IconRight
                        size={16}
                        weight="bold"
                    />
                )}
        </button>
    );
}