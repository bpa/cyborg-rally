import { ButtonOutline } from './Widgets';

export default class Lasers extends React.Component {
    laser(count) {
        ws.send({cmd:'laser', n:count});
    }

    btn(dmg) {
      return (
      <ButtonOutline py={4} style={{flex:"1 1 100px"}} key={dmg}
          color="red" onClick={this.laser.bind(this, dmg)}>
        {dmg} laser
      </ButtonOutline>);
    }

    render() { return (
<div>
    <ButtonOutline w={1} p={3} style={{marginBottom:'12px'}}
        color="green" onClick={this.laser.bind(this, 0)}>
        No Damage
    </ButtonOutline>
    <div style={{display:'flex'}} style={{marginBottom:'12px'}}>
    {this.btn(1)}
    {this.btn(2)}
    {this.btn(3)}
    {this.btn(4)}
    </div>
</div>
    )}
}
