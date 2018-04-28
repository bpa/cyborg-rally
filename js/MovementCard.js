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
        var src="#" + n;

        return (
          <span style={{height:"40px", width:"40px", marginTop:"8px"}}>
            <svg viewBox="0 0 100 100" style={style} onClick={this.props.onClick}>
              <g fill="currentColor" stroke="currentColor">
                <use href={src}/>
              </g>
            </svg>
          </span>
        );
    }
}
