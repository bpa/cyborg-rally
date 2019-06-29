import { GameContext } from './Util';
import React from 'react';
import { Button } from './UI';

export function Tile(props) {
  if (props.hide) {
    return null;
  }
  let state = GameContext.state || {};
  let Btn = state[GameContext.id] === props.id ? Button : Button;
  return (
    <Btn style={{ width: "100%", height: "0px", padding: "0", paddingBottom: "100%" }}>
      <div style={{ paddingTop: "45%" }}>{props.children}</div>
    </Btn>
  )
}

function rows(props) {
  var rows = [];
  var cols = props.cols || 2;
  var cb = props.onClick;
  var buttons = props.children;

  for (var i = 0; i < buttons.length; i += cols) {
    var pair = buttons.slice(i, i + cols).map(function (b) {
      return (
        <td width="50%" key={b.props.id} onClick={cb.bind(null, b.props.id)}>
          {b}
        </td>
      );
    });
    rows.push(
      <tr key={i}>
        {pair}
      </tr>
    );
  }
  return rows;
}

export function TileSet(props) {
  return (
    <table style={{ border: 0 }} width="100%">
      <tbody>{rows(props)}</tbody>
    </table>
  );
}