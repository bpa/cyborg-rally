import React, { Component } from 'react';
import styled from 'styled-components'

import { Box } from 'grommet';
export { Box, CheckBox, Meter, TextInput } from 'grommet';

export function Shutdown(props) {
  return (
    <Content>
      <img src="images/power-down.svg" style={{ width: "100%" }} alt="Shutdown" />
      {props.children}
    </Content>);
}

export function Dead() {
  return (
    <Content>
      <GiantEmoji>(x_x)</GiantEmoji>
    </Content>
  );
}

export const GiantEmoji = styled.div`
  line-height: 1.5;
  font-size: 120px;
  text-align: center;
`;

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

export const Button = styled.a`
  padding: 8px;
  margin: 0px 3px 3px 0px;
  outline: none;

  ${props => props.quit ? `
    --primary: red;
    --secondary: purple;
    --shadow: #d09988;
    --trim: #c00040;
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='red', endColorstr='purple',GradientType=0);
    color:white
    text-shadow:0px 1px 0px var(--secondary);
    ` : props.target ? `
    --primary: red;
    --secondary: #600000;
    --shadow: #d09999;
    --trim: #b00000;
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='black', endColorstr='red',GradientType=0);
    color: white;
    text-shadow:0px 1px 0px black;
  ` : `
    --primary: #ededed;
    --secondary: #bab1ba;
    --shadow: #899599;
    --trim: #d6bcd6;
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#bab1ba',GradientType=0);
    color:#3a8a9e;
    text-shadow:0px 1px 0px #e1e2ed;
  `
  }

  text-align: center;
  -moz-box-shadow: 3px 4px 0px 0px var(--shadow);
  -webkit-box-shadow: 3px 4px 0px 0px var(--shadow);
  box-shadow: 3px 4px 0px 0px var(--shadow);
  background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, var(--primary)), color-stop(1, var(--secondary)));
  background:-moz-linear-gradient(top, var(--primary) 5%, var(--secondary) 100%);
  background:-webkit-linear-gradient(top, var(--primary) 5%, var(--secondary) 100%);
  background:-o-linear-gradient(top, var(--primary) 5%, var(--secondary) 100%);
  background:-ms-linear-gradient(top, var(--primary) 5%, var(--secondary) 100%);
  background:linear-gradient(to bottom, var(--primary) 5%, var(--secondary) 100%);
  -moz-border-radius:15px;
  -webkit-border-radius:15px;
  border-radius:15px;
  border:1px solid var(--trim);
  display:inline-block;
  cursor:pointer;
  font-family:Arial;
  font-size:17px;
  padding:7px 25px;
  text-decoration:none;

  &:hover {
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, var(--secondary)), color-stop(1, var(--primary)));
    background:-moz-linear-gradient(top, var(--secondary) 5%, var(--primary) 100%);
    background:-webkit-linear-gradient(top, var(--secondary) 5%, var(--primary) 100%);
    background:-o-linear-gradient(top, var(--secondary) 5%, var(--primary) 100%);
    background:-ms-linear-gradient(top, var(--secondary) 5%, var(--primary) 100%);
    background:linear-gradient(to bottom, var(--secondary) 5%, var(--primary) 100%);
  }

  &:active {
    position:relative;
    top:1px;
  }
}`;

export function Dot(props) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12">
      <circle cx="6" cy="6" r="6" fill={props.bg}></circle>
    </svg>
  )
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

