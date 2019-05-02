import React from 'react';
import { Button, Panel } from './UI';
import styled from 'styled-components';

const ModalDiv = styled.div`
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      justify-content: center;
`;

export default function Modal(props) {
  const { children, close, closeText, ...rest } = props;
  return (
    <ModalDiv>
      <Panel {...rest}>
        {children}
        <Button bg="red" onClick={close}>
          {closeText || "Close"}
        </Button>
      </Panel>
    </ModalDiv>
  );

}

