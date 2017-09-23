import { Badge, Heading } from './Widgets';

export default class Vitality extends React.Component {
    render() {
        const p = this.props.player;
        const total = gs.opts.start_with_4_lives ? 4 :3;
		if (!p.memory) {
			return <div width="16px"/>;
		}
        //const dmg = ''.padEnd(p.damage, '♡').padStart(p.memory, '♥');
        //const lives = ''.padEnd(p.lives, '●').padEnd(3, '○');
        return (
<div style={{textAlign:'center'}}>
	<div>
    <span style={{fontWeight:'bold'}}>Health:</span>
		<Badge mr={0} bg="yellow" color="black">
      {p.memory-p.damage}/{p.memory}
    </Badge>
	</div>
	<div>
    <span>Life:</span>
		<Badge bg="green">{p.lives}/{total}</Badge>
	</div>
</div>
    )}
}
