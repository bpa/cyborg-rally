import { Card } from './Widgets';
import Register from './Register';
import Vitality from "./Vitality";
import Options from "./Options";
import Watermark from "./Watermark";

export default function Player (props) {
  const p = props.player;

  return (
      <Card bg={p.ready?'green':'red'} color="white"
          style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
          }}>
        <Register register={props.register}/>
        <Options player={p}/>
        <div style={{padding:'4px 0px'}}>{p.name}{p.shutdown ? '.zZ' : ''}</div>
        <Vitality player={p}/>
        <Watermark active={props.register
            && gs.id === props.register.player
            && p.options.Brakes
            && props.register.program[0].name === '1'}
          img='images/brakes.svg' text="Brakes"/>
      </Card>
  )
}
