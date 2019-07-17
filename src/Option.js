import { getFile } from './Util';
import React, { useState } from 'react';
import OptionModal from './OptionModal';

export function Option(props) {
  let [showing, setShowing] = useState(false);

  let o = props.card;
  return (
    <>
      <img src={getFile(o)}
        style={props.style}
        onClick={() => setShowing(true)}
        alt={o.name}
      />
      {showing && <OptionModal card={o} done={() => setShowing(false)} key={o.name} />}
    </>
  );
}
