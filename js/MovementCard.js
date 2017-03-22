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
        var style = {
            borderRadius:6,
            background: 'white',
            color: 'black'
        };
        if (this.props.damaged) {
           style.color = 'white';
           style.background = 'radial-gradient(red, black)';
        }
        return (
        <ButtonOutline theme="default" style={style} onClick={this.props.onClick}>
            {m ? m : n}
        </ButtonOutline>
    )}
}
