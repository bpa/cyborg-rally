import { Card, Text } from './Widgets';
import Ready from './Ready';

export default class Waiting extends React.Component {
  player(p) {
    return (
      <Card key={p.name} bg={p.ready?'green':'red'} color="white">
        <Text center p={2}>{p.name}</Text>
      </Card>
    );
  }

  render() {
    const players = this.props.players;
    const joined = Object.keys(players);
  return (
<div>
	<Ready ready={this.props.me.ready}/>
    <hr style={{marginTop:"0", marginBottom:"12"}}/>
    {joined.sort().map((id) => this.player(players[id]))}
</div>
  )}
}
