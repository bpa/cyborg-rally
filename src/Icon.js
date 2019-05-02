import { GameContext, getFile } from './Util';
import React from 'react';
import styled from 'styled-components';

const IconElement = styled.span`
    display: inline-block;
    color: black;
    border: thin solid black;
    border-radius: 6px;
    overflow: hidden;
    padding: 2px;
    height: 40px;
    width: 40px;

    svg, img {
        display: block;
        height: 40px;
        width: 40px;
    }

    &.locked {
        color: white;
        background: radial-gradient(red, black);
    }

    &.selected {
        color: white;
        background: radial-gradient(yellow, orange);
    }

    &.help {
        color: white;
        background: radial-gradient(white, blue);
    }

    &.inactive {
        color: darkGrey;
        background: lightGrey;
        border: thin solid grey;
    }

    &.add-on {
        color: green;
        background: white;
        border: thin solid green;
    }
`;

export default function Icon(props) {
    const { card, src, option, name, ...rest } = props;
    if (rest.onClick) {
        rest.className = (rest.className || "") + " button";
    }

    if (card !== undefined) {
        return (
            <IconElement {...rest}>
                <svg viewBox="0 0 100 100">
                    <g fill="currentColor" stroke="currentColor">
                        <use href={"#" + card.name} />
                    </g>
                </svg>
            </IconElement>
        );
    }

    var imgSrc = src
        || (name && getFile(GameContext.public.player[GameContext.id].options[name]))
        || (option && getFile(option));

    return imgSrc &&
        (
            <IconElement {...rest}>
                <img src={imgSrc} alt={name} />
            </IconElement>
        );
}
