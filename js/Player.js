import { Box, Card, Flex } from './Widgets';
import Register from './Register';
import Vitality from "./Vitality";
import Options from "./Options";
import Watermark from "./Watermark";

export default function Player (props) {
  const p = props.player;
  let watermark = null;
  if (props.register && gs.id === props.register.player) {
    if (p.options.Brakes && props.register.program[0].name === '1') {
      watermark = <Watermark img='images/brakes.svg' text="Brakes"/>;
    }
  }

  return (
      <Card bg={p.ready?'green':'red'} color="white" p={1}
          style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
          }}>
        {watermark}
        <Register register={props.register}/>
        <Options player={p}/>
        <div style={{padding:'4px 0px'}}>{p.name}{p.shutdown ? '.zZ' : ''}</div>
        <Vitality player={p}/>
      </Card>
  )
}
