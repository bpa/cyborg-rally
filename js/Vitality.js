import Badge from 'rebass/src/Badge';
import Heading from 'rebass/src/Heading';
import Progress from 'rebass/src/Progress';

export default class Vitality extends React.Component {
    render() {
        const p = this.props.player;
		if (!p.memory) {
			return <div/>;
		}
        //const dmg = ''.padEnd(p.damage, '♡').padStart(p.memory, '♥');
        //const lives = ''.padEnd(p.lives, '●').padEnd(3, '○');
        return (
<div style={{textAlign:'center', position:'absolute', right:'24px'}}>
	<Heading level={5}>Health:
		<Badge pill rounded theme="error">{p.memory-p.damage}/{p.memory}</Badge>
	</Heading>
		<Heading level={5}>Life:
		<Badge pill rounded theme="success">{p.lives}/3</Badge>
	</Heading>
</div>
    )}
}
