import MovementCard from './MovementCard';

export default class Register extends React.Component {
    render() {
        const register = this.props.register;
        if (!register) {
			return <div style={{width:"16px"}}/>;
        }
        const program = this.props.register.program;
        var name = program.reduce((a, b) => a + b.name, '');
        return (
          <MovementCard
            onClick={this.props.onClick}
            damaged={register.damaged}
            inactive={this.props.inactive}
            card={{name:name||'null'}}/>
        )
    }
}
