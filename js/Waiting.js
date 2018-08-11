import Ready from './Ready';
import Players from './Players';
import { Content, Hr } from './Widgets';
import Watermark from './Watermark';

export default class Waiting extends React.Component {
  gyroscopic_stabilizer() {
    let state = gs.public.state;
    let options = gs.public.player[gs.id].options
    let stabilizer = options['Gyroscopic Stabilizer'];
    if ((state.includes('conveyor') || state === "gears") &&
      stabilizer !== undefined && stabilizer.tapped) {
      return <Watermark active={true} img='images/gyroscopic-stabilizer.svg' text="Gyroscopic Stabilizer"/>
    }
    return null;
  }

  render() {
    return (
<Content p={0}>
	<Ready ready={this.props.me.ready}/>
  <Hr/>
  <Players players={this.props.players}/>
  {this.gyroscopic_stabilizer()}
</Content>
  )}
}
