import Modal from './Modal';

export default class Option extends React.Component {
  constructor(props) {
    super(props);
    let o = this.props.card;
    this.re = new RegExp(' ', 'g');
    this.file = "images/" + o.name.toLowerCase().replace(this.re, "-") + ".svg";
    this.state = { showing: false };
    this.done = this.done.bind(this);
    this.show = this.show.bind(this);
  }

  done() {
    this.setState({ showing: false });
  }

  show() {
    this.setState({ showing: true });
  }

  card() {
    let imgStyle = {
      width: '60px',
      height: '60px',
      margin: '5px',
      backgroundColor: 'green',
      borderRadius: 6,
      overflow: 'hidden',
      float: 'left',
    };
    return this.state.showing ? (
      <Modal title={this.props.card.name} closeText="Done" close={this.done}>
        <div style={imgStyle}>
          <img src={this.file} style={{width: '100%'}}/>
        </div>
        <span style={{color: 'black'}}>{this.props.card.text}</span>
      </Modal>)
      : null;
  }

  render() {
    let o = this.props.card;
    if (o.uses > 0) {
        file += o.uses;
    }
    return (
      <span>
        <img src={this.file}
            style={this.props.style}
            onClick={this.show}
        />
        {this.card()}
      </span>);
  }
}
