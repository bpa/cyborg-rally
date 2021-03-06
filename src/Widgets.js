import React from 'react';
import { Button as rButton, Card as rCard, Dot, Flex } from 'rebass';
import styled from 'styled-components'

export function Shutdown(props) {
  return (
    <div>
      <img src="images/power-down.svg" style={{ width: "100%" }} />
      {props.children}
    </div>);
}

export function Registers(props) {
  return (
    <div>
      <Dot bg={props.active == 0 ? 'white' : 'grey'} />
      <Dot bg={props.active == 1 ? 'white' : 'grey'} />
      <Dot bg={props.active == 2 ? 'white' : 'grey'} />
      <Dot bg={props.active == 3 ? 'white' : 'grey'} />
      <Dot bg={props.active == 4 ? 'white' : 'grey'} />
    </div>
  );
}

export const Button = styled(rButton)([])

Button.defaultProps = {
  px: 3,
  mt: 2,
  borderRadius: 99999
}

export const Card = styled(rCard)([])

Card.defaultProps = {
  px: 3,
  mt: 2,
}

export const Content = styled(Flex)([])

Content.defaultProps = {
  flexDirection: "column",
  p: 2,
  pt: 0,
}

export const Hr = styled.hr`
  margin-top: 8px;
  margin-bottom: 0px;
  width: 100%;
`
