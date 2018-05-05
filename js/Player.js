import { Card } from './Widgets';
import Register from './Register';
import Vitality from "./Vitality";
import Options from "./Options";
import Watermark from "./Watermark";

export default function Player (props) {
  const p = props.player;
  let watermark = null;
  if (props.register && gs.id === props.register.player) {
    const r = props.register.program[0].name;
    if (p.options.Brakes && r === '1') {
      watermark = <Watermark active={true} img='images/brakes.svg' text="Brakes"/>
    }
    else if (p.options['Fourth Gear'] && r === '3') {
      watermark = <Watermark active={true} img='images/fourth-gear.svg' text="Fourth Gear"/>
    }
    else if (p.options['Reverse Gear'] && r === 'b') {
      watermark = <Watermark active={true} img='images/reverse-gear.svg' text="Reverse Gear"/>
    }
  }

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
        {watermark}
      </Card>
  )
}
