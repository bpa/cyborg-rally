import Block from 'rebass/src/Block';
import MovementCard from './MovementCard';

export default class Register extends React.Component {
    render() {
        const program = this.props.register.program;
        return (
          <MovementCard onClick={this.props.onClick}
            card={program[0]?program[0]:{}}/>
        )
    }
}
