import Badge from 'rebass/dist/Badge';
import Heading from 'rebass/dist/Heading';

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
	<Heading level={5}>Health:
		<Badge pill rounded style={{backgroundColor:'yellow', color:'black'}}>
            {p.memory-p.damage}/{p.memory}
        </Badge>
	</Heading>
	<Heading level={5}>Life:
		<Badge pill rounded theme="success">{p.lives}/{total}</Badge>
	</Heading>
</div>
    )}
}
