import MovementCard from './MovementCard';

export default class Register extends React.Component {
    render() {
        const register = this.props.register;
        if (!register) {
            return null;
        }
        const program = this.props.register.program;
        return (
          <MovementCard onClick={this.props.onClick}
            card={program[0]?program[0]:{name:'␀'}}/>
        )
    }
}
