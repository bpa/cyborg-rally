import { ButtonOutline } from './Widgets';

var MAP = {
    'r': '↱',
    'l': '↰',
    'u': '⋂',
    'b': '⇩'
};

export default class MovementCard extends React.Component {
    normal() {
        return {
            color: 'black',
            background: 'white'
        };
    }
    damaged() {
        return {
            color: 'white',
            background: 'radial-gradient(red, black)'
        };
    }
    inactive() {
        return {
            color: 'darkGrey',
            background: 'lightGrey'
        };
    }
    addOn() {
        return {
            color: 'green',
            background: 'white'
        };
    }
    render() {
        const n = this.props.card.name;
        const m = MAP[n] || n;
        var style
            = this.props.damaged  ? this.damaged()
            : this.props.inactive ? this.inactive()
            : this.props.addOn    ? this.addOn()
            :                       this.normal();
        style.borderRadius = 6;

        if (this.props.damaged || this.props.inactive) {
           return <ButtonOutline style={style}>{m}</ButtonOutline>;
        }
        else {
           return (
             <ButtonOutline style={style} onClick={this.props.onClick}>
                 {m}
             </ButtonOutline>
           );
        }
    }
}
