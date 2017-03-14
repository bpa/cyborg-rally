import ButtonOutline from 'rebass/src/ButtonOutline';

var MAP = {
    'r': '↱',
    'l': '↰',
    'u': '⋂',
    'b': '⇩'
};

export default class MovementCard extends React.Component {
    render() {
        const n = this.props.card.name;
        const m = MAP[n];
        return (
        <ButtonOutline theme="default" style={{borderRadius:6}}
                onClick={this.props.onClick}>
            {m ? m : n}
        </ButtonOutline>
    )}
}
