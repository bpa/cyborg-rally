import {
    Box as WBox,
    ButtonCircle as WButtonCircle,
    Card as WCard,
    Column as WColumn,
    DotButton,
    Flex,
    Input as WInput,
    Panel as WPanel,
    PanelHeader as WPanelHeader,
} from 'rebass';

import styled from 'styled-components';

export { Badge, ButtonOutline, Checkbox, Circle, Flex, Heading, Label, Lead, Radio, Row, Space, Text } from 'rebass';

export function Box(props) {
    return <WBox {...props} mb={2}/>;
}

export function ButtonCircle(props) {
    return <WButtonCircle {...props} w={1} style={{marginBottom: '12px'}}/>;
}

export function Card(props) {
  var style = props.style || {};
  style.marginBottom = '12px';
  return <WCard {...props} style={style}/>
}

export function Column(props) {
    return <WColumn {...props} style={{marginBottom: '12px'}}/>
}

export function Input(props) {
    return <WInput {...props} w={1} style={{marginBottom: '12px'}}/>;
}

export function Panel(props) {
    return <WPanel {...props} style={{bottom: '0px'}}/>;
}

export function PanelHeader(props) {
  var style = props.style || {};
  style.marginBottom = '12px';
  return <WPanelHeader {...props} style={style}/>;
}

export function Shutdown() {
    return <div style={{textAlign:'center',fontSize:120}}>ZZZ</div>;
}

export function Register(props) {
  return (
    <Flex>
      <DotButton active={props.active == 0}/>
      <DotButton active={props.active == 1}/>
      <DotButton active={props.active == 2}/>
      <DotButton active={props.active == 3}/>
      <DotButton active={props.active == 4}/>
    </Flex>
  );
}
