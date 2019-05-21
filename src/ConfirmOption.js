import { GameContext, getFile } from './Util';
import React, { useContext } from 'react';
import { Button } from './UI';
import Modal from './Modal';

const imgStyle = {
  width: '60px',
  height: '60px',
  margin: '5px',
  padding: '4px',
  backgroundColor: 'green',
  borderRadius: 6,
  float: 'left',
};

export default function ConfirmOption(props) {
  let context = useContext(GameContext);

  let option = props.option;
  if (!option) {
    return null;
  }
  let src = getFile(context.me.options[option.name])

  return (
    <Modal
      title={props.title || 'Confirm'}
      closeText={props.closeText || 'Cancel'}
      close={props.onCancel}
    >
      <span style={{ color: 'black' }}>
        <img style={imgStyle} src={src} onClick={props.onClick} alt="Are you sure?" />
        <div style={{ marginTop: '8px' }}>{option.message}</div>
        <p>Are you sure?</p>
      </span>
      <Button onClick={props.onConfirm} bg="green">
        Yes
      </Button>
    </Modal>
  );
}
