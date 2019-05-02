import { getFile } from './Util';
import React from 'react';
import Modal from './Modal';

const imgStyle = {
  width: '60px',
  height: '60px',
  margin: '5px',
  backgroundColor: 'green',
  borderRadius: 6,
  overflow: 'hidden',
  float: 'left',
};

export default function OptionModal(props) {
  let file = getFile(props.card);
  return (
    <Modal title={props.card.name} closeText="Done" close={props.done}>
      <div style={imgStyle}>
        <img src={file} style={{ width: '100%' }} alt={props.card.name} />
      </div>
      <span style={{ color: 'black' }}>{props.card.text}</span>
    </Modal>
  );
}
