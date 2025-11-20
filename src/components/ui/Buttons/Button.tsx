import React, { ReactNode } from 'react';

import { Link } from 'react-router-dom';

import './Button.css';

type ButtonProps = {
    children?: ReactNode;
    buttonClass?: string;
    to?: string;
    // eslint-disable-next-line no-unused-vars
    onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
};

const Button: React.FC<ButtonProps> = ({
    children,
    buttonClass = '',
    to,
    onClick,
    type = 'button',
    disabled = false,
    href,
    target,
    rel
}) => {
    if (href) {
        return (
            <a href={href} className={` ${buttonClass}`} target={target} rel={rel}>
                {children}
            </a>
        );
    }

    if (to) {
        return (
            <Link to={to} className={` ${buttonClass}`} onClick={onClick}>
                {children}
            </Link>
        );
    }

    return (
        <button className={` ${buttonClass}`} onClick={onClick} type={type} disabled={disabled}>
            {children}
        </button>
    );
};

export default Button;
