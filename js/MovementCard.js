import { ButtonOutline } from './Widgets';

export default class MovementCard extends React.Component {
    normal() {
        return {
            color: 'black',
            border: 'thin solid black',
        };
    }
    damaged() {
        return {
            color: 'white',
            background: 'radial-gradient(red, black)',
            border: 'thin solid black',
        };
    }
    inactive() {
        return {
            color: 'darkGrey',
            background: 'lightGrey',
            border: 'thin solid grey',
        };
    }
    addOn() {
        return {
            color: 'green',
            background: 'white',
            border: 'thin solid green',
        };
    }
    render() {
        const n = this.props.card.name;
        var style
            = this.props.damaged  ? this.damaged()
            : this.props.inactive ? this.inactive()
            : this.props.addOn    ? this.addOn()
            :                       this.normal();
        style.borderRadius = 6;
        style.height = "40px";
        style.width = "40px";
        var src="#" + n;

        return (
          <svg viewBox="0 0 100 100" style={style} onClick={this.props.onClick}>
            <g fill="currentColor" stroke="currentColor">
              <use href={src}/>
            </g>
          </svg>
        );
    }
}
