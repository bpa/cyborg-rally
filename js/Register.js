import MovementCard from './MovementCard';

export default class Register extends React.Component {
    render() {
        const register = this.props.register;
        if (!register) {
			return <div style={{width:"16px"}}/>;
        }
        const program = this.props.register.program;
        return (
          <MovementCard onClick={this.props.onClick} damaged={register.damaged}
            card={program[0]?program[0]:{name:'␀'}}/>
        )
    }
}
