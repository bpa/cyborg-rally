import React, { Component } from 'react';
import styled from 'styled-components'

import { Box } from 'grommet';
export { Box, CheckBox, Meter, TextInput } from 'grommet';

export function Shutdown(props) {
  return (
    <div>
      <img src="images/power-down.svg" style={{ width: "100%" }} alt="Shutdown" />
      {props.children}
    </div>);
}

export const Badge = styled.span`
  border-radius: 1em;
  color: white;
  background-color: blue;
  display: inline-block;
  padding: .25em .5em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
`;

export const Button = styled.span`
  padding: 8px;
  outline: none;
  
  text-align: center;
  color: hsla(0,0%,20%,1);
  text-shadow: hsla(0,0%,40%,.5) 0 -1px 0, hsla(0,0%,100%,.6) 0 2px 1px;
  
  background-color: ${props => props.background || 'hsl(0,0%,90%)'};
  box-shadow: inset hsla(0,0%,15%,  1) 0  0px 0px 4px, /* border */
    inset hsla(0,0%,15%, .8) 0 -1px 5px 4px, /* soft SD */
    inset hsla(0,0%,0%, .25) 0 -1px 0px 7px, /* bottom SD */
    inset hsla(0,0%,100%,.7) 0  2px 1px 7px, /* top HL */
    
    hsla(0,0%, 0%,.15) 0 -5px 6px 4px, /* outer SD */
    hsla(0,0%,100%,.5) 0  5px 6px 4px; /* outer HL */ 
  
  transition: color .2s;
  border-radius: .5em;
  background-image: 

&:active {
  color: hsl(210, 100%, 40%);
  text-shadow: hsla(210,100%,20%,.3) 0 -1px 0, hsl(210,100%,85%) 0 2px 1px, hsla(200,100%,80%,1) 0 0 5px, hsla(210,100%,50%,.6) 0 0 20px;
  box-shadow: 
    inset hsla(210,100%,30%,  1) 0  0px 0px 4px, /* border */
    inset hsla(210,100%,15%, .4) 0 -1px 5px 4px, /* soft SD */
    inset hsla(210,100%,20%,.25) 0 -1px 0px 7px, /* bottom SD */
    inset hsla(210,100%,100%,.7) 0  2px 1px 7px, /* top HL */
    
    hsla(210,100%,75%, .8) 0  0px 3px 2px, /* outer SD */
    hsla(210,50%,40%, .25) 0 -5px 6px 4px, /* outer SD */
    hsla(210,80%,95%,   1) 0  5px 6px 4px; /* outer HL */
}`;

export function Dot(props) {
  return (<span>X</span>

  );
  // <svg viewBox="0 0 12 12" width="12" height="12">
  //   <circle cx="6" cy="6" r="6" fill={props.bg}></circle>
  // </svg>
}

export function Registers(props) {
  return (
    <div>
      <Dot bg={props.active === 0 ? 'white' : 'grey'} />
      <Dot bg={props.active === 1 ? 'white' : 'grey'} />
      <Dot bg={props.active === 2 ? 'white' : 'grey'} />
      <Dot bg={props.active === 3 ? 'white' : 'grey'} />
      <Dot bg={props.active === 4 ? 'white' : 'grey'} />
    </div>
  );
}

export function Frame(props) {
  const { background, children, ...rest } = props;
  return (
    <Box background={background} border={{ color: background, size: 'small' }}
      overflow="hidden" round="small" {...rest}>
      {children}
    </Box>
  );
}

export function Content(props) {
  const { children, ...rest } = props;

  return (
    <Box className="content" round="small" pad="xsmall" wrap={true} background="white" {...rest}>
      {children}
    </Box>
  );
}

export class Panel extends Component {
  static displayName = 'Panel';

  render() {
    const { children, background, header, onHelp, title, ...rest } = this.props;

    return (
      <Frame background={background || 'brand'}>
        <Box pad="medium" align="center" direction="row" gap="xsmall">
          {title || header}
          {onHelp && <Badge onClick={onHelp}>?</Badge>}
        </Box>
        <Content {...rest}>
          {children}
        </Content>
      </Frame>
    );
  }
}

