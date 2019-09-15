import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from './UI';
import { GameContext } from './Util';

export var Tile = observer(props => {
  let context = useContext(GameContext);

  if (props.hide) {
    return null;
  }

  return (
    <Button target={context.state[context.id] === props.id}
      style={{ width: "100%", height: "0px", padding: "0", paddingBottom: "100%" }}>
      <div style={{ paddingTop: "45%" }}>{props.children}</div>
    </Button>
  )
});

export function TileSet(props) {
  var rows = [];
  var cols = props.cols || 2;
  var cb = props.onClick;
  var buttons = props.children;

  for (var i = 0; i < buttons.length; i += cols) {
    var pair = buttons.slice(i, i + cols).map(function (b) {
      return (
        <td width="50%" key={b.props.id} onClick={() => cb(b.props.id)}>
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

  return (
    <table style={{ border: 0 }} width="100%">
      <tbody>{rows}</tbody>
    </table>
  );
}
