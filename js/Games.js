import Heading from 'rebass/src/Heading';

export default class Games extends React.Component {
    render() {
        if (this.props.games) {
            return <div>{this.props.games}</div>;
        }
        return <div style={{width: "100%", textAlign: 'center'}}>
            <Heading theme="error">No games available</Heading>
            </div>
    }
}

