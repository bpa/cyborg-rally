import {
    Box as WBox,
    ButtonCircle as WButtonCircle,
    Card as WCard,
    Input as WInput,
    Panel as WPanel,
} from 'rebass';

import styled from 'styled-components';

export { Checkbox, Heading, Label, Lead, PanelHeader, Radio, Text } from 'rebass';

export function Box(props) {
    return <WBox {...props} style={{paddingTop:'4px',paddingBottom:'0px'}}/>;
}

export function ButtonCircle(props) {
    return <WButtonCircle {...props} w={1} style={{marginBottom: '12px'}}/>;
}

export function Card(props) {
    return <WCard {...props} style={{marginBottom: '12px'}}/>
}

export function Input(props) {
    return <WInput {...props} w={1} style={{marginBottom: '12px'}}/>;
}

export function Panel(props) {
    return <WPanel {...props} style={{bottom: '0px'}}/>;
}

export function Shutdown() {
    return <div style={{textAlign:'center',fontSize:120}}>ZZZ</div>;
}

