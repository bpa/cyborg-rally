const SPACE = new RegExp(' ', 'g');
export default class Icon extends React.Component {
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
      var style
        = this.props.damaged  ? this.damaged()
        : this.props.inactive ? this.inactive()
        : this.props.addOn    ? this.addOn()
        :                       this.normal();
        style.borderRadius = 6;
        style.marginTop = '8px';
        style.marginLeft = '8px';
    if (this.props.card !== undefined) {
      style.height = '40px';
      style.width = '40px';
      return (
        <svg viewBox="0 0 100 100" style={style} onClick={this.props.onClick}>
          <g fill="currentColor" stroke="currentColor">
            <use href={"#" + this.props.card.name}/>
          </g>
        </svg>
      );
    }
    if (this.props.src !== undefined) {
      return (
        <span style={style} onClick={this.props.onClick}>
          <img style={{height: '40px', width: '40px', padding: '4px'}}
            src={this.props.src}/>
        </span>
      );
    }
    if (this.props.name !== undefined) {
      let file = "images/" + this.props.name.toLowerCase().replace(SPACE, "-") + ".svg";
      return (
        <span style={style} onClick={this.props.onClick}>
          <img style={{height: '40px', width: '40px', padding: '4px'}}
            src={file}/>
        </span>
      );
    }
    return null;
  }
}
