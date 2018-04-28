import { Heading } from 'rebass';
import { Content } from './Widgets';

export default class Games extends React.Component {
    render() {
        if (this.props.games) {
            return <Content p={0}>{this.props.games}</Content>;
        }
        return <div style={{width: "100%", textAlign: 'center'}}>
            <Heading theme="error">No games available</Heading>
            </div>
    }
}

